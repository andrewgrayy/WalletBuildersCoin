from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from web3 import Web3
from eth_account import Account
import secrets
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Web3 setup (using multiple RPC providers for reliability)
RPC_PROVIDERS = [
    'https://cloudflare-eth.com',
    'https://rpc.ankr.com/eth',
    'https://eth.llamarpc.com'
]

def get_web3_connection():
    for rpc in RPC_PROVIDERS:
        try:
            w3_instance = Web3(Web3.HTTPProvider(rpc, request_kwargs={'timeout': 10}))
            if w3_instance.is_connected():
                return w3_instance
        except:
            continue
    return Web3(Web3.HTTPProvider(RPC_PROVIDERS[0], request_kwargs={'timeout': 10}))

w3 = get_web3_connection()

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Models
class WalletCreate(BaseModel):
    name: Optional[str] = "My Wallet"

class WalletResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    address: str
    private_key: str
    name: str
    created_at: str

class WalletImport(BaseModel):
    private_key: str
    name: Optional[str] = "Imported Wallet"

class BalanceResponse(BaseModel):
    address: str
    balance: str
    balance_eth: float

class TokenCreate(BaseModel):
    name: str
    symbol: str
    total_supply: int
    decimals: int = 18

class TokenResponse(BaseModel):
    name: str
    symbol: str
    total_supply: int
    decimals: int
    contract_code: str

class ContractGenerate(BaseModel):
    description: str

class ContractResponse(BaseModel):
    contract_code: str
    explanation: str

class TransactionSend(BaseModel):
    from_private_key: str
    to_address: str
    amount_eth: float

class TransactionResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    tx_hash: str
    from_address: str
    to_address: str
    amount_eth: float
    status: str
    timestamp: str

# Routes
@api_router.get("/")
async def root():
    return {"message": "Obsidian Forge API"}

@api_router.post("/wallet/create", response_model=WalletResponse)
async def create_wallet(wallet_data: WalletCreate):
    """Create a new Ethereum wallet"""
    try:
        # Generate random private key
        private_key = "0x" + secrets.token_hex(32)
        account = Account.from_key(private_key)
        
        wallet = {
            "address": account.address,
            "private_key": private_key,
            "name": wallet_data.name,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Store in database (excluding _id)
        await db.wallets.insert_one({**wallet})
        
        return WalletResponse(**wallet)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/wallet/import", response_model=WalletResponse)
async def import_wallet(wallet_data: WalletImport):
    """Import an existing wallet using private key"""
    try:
        private_key = wallet_data.private_key
        if not private_key.startswith('0x'):
            private_key = '0x' + private_key
            
        account = Account.from_key(private_key)
        
        wallet = {
            "address": account.address,
            "private_key": private_key,
            "name": wallet_data.name,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Store in database
        await db.wallets.insert_one({**wallet})
        
        return WalletResponse(**wallet)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid private key: {str(e)}")

@api_router.get("/wallet/balance/{address}", response_model=BalanceResponse)
async def get_balance(address: str):
    """Get ETH balance for an address"""
    try:
        if not w3.is_address(address):
            raise HTTPException(status_code=400, detail="Invalid Ethereum address")
        
        balance_wei = w3.eth.get_balance(address)
        balance_eth = w3.from_wei(balance_wei, 'ether')
        
        return BalanceResponse(
            address=address,
            balance=str(balance_wei),
            balance_eth=float(balance_eth)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/wallets", response_model=List[WalletResponse])
async def get_wallets():
    """Get all stored wallets"""
    wallets = await db.wallets.find({}, {"_id": 0}).to_list(100)
    return wallets

@api_router.post("/token/create", response_model=TokenResponse)
async def create_token(token_data: TokenCreate):
    """Generate ERC-20 token smart contract code"""
    try:
        contract_code = f"""// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract {token_data.symbol}Token is ERC20, Ownable {{
    constructor() ERC20("{token_data.name}", "{token_data.symbol}") Ownable(msg.sender) {{
        _mint(msg.sender, {token_data.total_supply} * 10 ** decimals());
    }}
    
    function mint(address to, uint256 amount) public onlyOwner {{
        _mint(to, amount);
    }}
}}"""
        
        # Store token info
        token_doc = {
            "name": token_data.name,
            "symbol": token_data.symbol,
            "total_supply": token_data.total_supply,
            "decimals": token_data.decimals,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.tokens.insert_one(token_doc)
        
        return TokenResponse(
            name=token_data.name,
            symbol=token_data.symbol,
            total_supply=token_data.total_supply,
            decimals=token_data.decimals,
            contract_code=contract_code
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/contract/generate", response_model=ContractResponse)
async def generate_contract(contract_data: ContractGenerate):
    """Use AI to generate a smart contract based on description"""
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="API key not configured")
        
        chat = LlmChat(
            api_key=api_key,
            session_id=str(uuid.uuid4()),
            system_message="You are an expert Solidity smart contract developer. Generate secure, well-commented smart contract code based on user requirements. Always include SPDX license identifier and pragma statements."
        ).with_model("openai", "gpt-5.2")
        
        prompt = f"""Generate a complete Solidity smart contract for: {contract_data.description}

Requirements:
1. Use Solidity ^0.8.20
2. Follow best practices and security standards
3. Include all necessary imports
4. Add comprehensive comments
5. Make it production-ready

Provide ONLY the smart contract code, no additional explanation."""
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Extract code from response
        contract_code = response.strip()
        if "```solidity" in contract_code:
            contract_code = contract_code.split("```solidity")[1].split("```")[0].strip()
        elif "```" in contract_code:
            contract_code = contract_code.split("```")[1].split("```")[0].strip()
        
        # Store generated contract
        contract_doc = {
            "description": contract_data.description,
            "code": contract_code,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.contracts.insert_one(contract_doc)
        
        return ContractResponse(
            contract_code=contract_code,
            explanation=f"Smart contract generated for: {contract_data.description}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate contract: {str(e)}")

@api_router.post("/transaction/send", response_model=TransactionResponse)
async def send_transaction(tx_data: TransactionSend):
    """Send ETH transaction (Note: This requires testnet/mainnet with funded wallet)"""
    try:
        private_key = tx_data.from_private_key
        if not private_key.startswith('0x'):
            private_key = '0x' + private_key
            
        account = Account.from_key(private_key)
        
        # Build transaction
        nonce = w3.eth.get_transaction_count(account.address)
        amount_wei = w3.to_wei(tx_data.amount_eth, 'ether')
        
        transaction = {
            'nonce': nonce,
            'to': tx_data.to_address,
            'value': amount_wei,
            'gas': 21000,
            'gasPrice': w3.eth.gas_price,
            'chainId': 1  # Mainnet
        }
        
        # Sign transaction
        signed_txn = w3.eth.account.sign_transaction(transaction, private_key)
        
        # Send transaction
        tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
        
        # Store transaction
        tx_doc = {
            "tx_hash": tx_hash.hex(),
            "from_address": account.address,
            "to_address": tx_data.to_address,
            "amount_eth": tx_data.amount_eth,
            "status": "pending",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await db.transactions.insert_one(tx_doc)
        
        return TransactionResponse(**tx_doc)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transaction failed: {str(e)}")

@api_router.get("/transactions", response_model=List[TransactionResponse])
async def get_transactions():
    """Get all transactions"""
    transactions = await db.transactions.find({}, {"_id": 0}).to_list(100)
    return transactions

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()