import requests
import sys
import json
from datetime import datetime

class CryptoWalletAPITester:
    def __init__(self, base_url="https://crypto-maker-11.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_wallet = None
        self.imported_wallet = None
        self.created_token = None
        self.generated_contract = None

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if endpoint else self.api_url
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed")
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout after {timeout}s")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        success, response = self.run_test(
            "API Root Endpoint",
            "GET",
            "",
            200
        )
        return success

    def test_create_wallet(self):
        """Test wallet creation"""
        success, response = self.run_test(
            "Create Wallet",
            "POST",
            "wallet/create",
            200,
            data={"name": "Test Wallet"}
        )
        if success and 'address' in response:
            self.created_wallet = response
            print(f"   Created wallet: {response['address']}")
        return success

    def test_import_wallet(self):
        """Test wallet import with a valid private key"""
        # Using a test private key (this is safe for testing)
        test_private_key = "0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318"
        
        success, response = self.run_test(
            "Import Wallet",
            "POST",
            "wallet/import",
            200,
            data={"private_key": test_private_key, "name": "Imported Test Wallet"}
        )
        if success and 'address' in response:
            self.imported_wallet = response
            print(f"   Imported wallet: {response['address']}")
        return success

    def test_get_wallets(self):
        """Test getting all wallets"""
        success, response = self.run_test(
            "Get All Wallets",
            "GET",
            "wallets",
            200
        )
        if success:
            print(f"   Found {len(response)} wallets")
        return success

    def test_get_balance(self):
        """Test getting wallet balance"""
        if not self.created_wallet:
            print("⚠️  Skipping balance test - no wallet created")
            return True
            
        address = self.created_wallet['address']
        success, response = self.run_test(
            "Get Wallet Balance",
            "GET",
            f"wallet/balance/{address}",
            200
        )
        if success:
            print(f"   Balance: {response.get('balance_eth', 0)} ETH")
        return success

    def test_create_token(self):
        """Test ERC-20 token creation"""
        success, response = self.run_test(
            "Create ERC-20 Token",
            "POST",
            "token/create",
            200,
            data={
                "name": "Test Token",
                "symbol": "TEST",
                "total_supply": 1000000,
                "decimals": 18
            }
        )
        if success and 'contract_code' in response:
            self.created_token = response
            print(f"   Token created: {response['name']} ({response['symbol']})")
        return success

    def test_generate_contract(self):
        """Test AI contract generation"""
        success, response = self.run_test(
            "Generate AI Smart Contract",
            "POST",
            "contract/generate",
            200,
            data={"description": "Create a simple voting contract where users can vote for candidates"},
            timeout=60  # AI generation might take longer
        )
        if success and 'contract_code' in response:
            self.generated_contract = response
            print(f"   Contract generated successfully")
        return success

    def test_invalid_endpoints(self):
        """Test error handling for invalid requests"""
        print(f"\n🔍 Testing Error Handling...")
        
        # Test invalid wallet import
        success, _ = self.run_test(
            "Invalid Private Key Import",
            "POST",
            "wallet/import",
            400,
            data={"private_key": "invalid_key", "name": "Invalid Wallet"}
        )
        
        # Test invalid balance request
        success2, _ = self.run_test(
            "Invalid Address Balance",
            "GET",
            "wallet/balance/invalid_address",
            400
        )
        
        # Test missing token data
        success3, _ = self.run_test(
            "Missing Token Data",
            "POST",
            "token/create",
            422,  # Validation error
            data={"name": ""}
        )
        
        return success and success2

def main():
    print("🚀 Starting Crypto Wallet API Tests...")
    print("=" * 60)
    
    tester = CryptoWalletAPITester()
    
    # Run all tests
    tests = [
        tester.test_root_endpoint,
        tester.test_create_wallet,
        tester.test_import_wallet,
        tester.test_get_wallets,
        tester.test_get_balance,
        tester.test_create_token,
        tester.test_generate_contract,
        tester.test_invalid_endpoints
    ]
    
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 FINAL RESULTS")
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())