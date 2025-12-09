import requests
from bs4 import BeautifulSoup

url = 'https://www.vnjpclub.com/minna-no-nihongo/bai-14-tu-vung.html'
headers = {'User-Agent': 'Mozilla/5.0'}

try:
    response = requests.get(url, headers=headers, timeout=10)
    print(f"Status: {response.status_code}")
    print(f"Content length: {len(response.text)}")
    
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # In ra HTML thô để xem cấu trúc
    print("\n--- HTML snippet ---")
    print(response.text[:3000])
    
    # Tìm tất cả table
    tables = soup.find_all('table')
    print(f"\nSố table: {len(tables)}")
    
    # Tìm tất cả tr
    trs = soup.find_all('tr')
    print(f"Số tr: {len(trs)}")
    
    # In vài row đầu tiên
    for i, tr in enumerate(trs[:5]):
        print(f"\nRow {i}: {tr.get_text(strip=True)[:100]}")
        
except Exception as e:
    print(f"Lỗi: {e}")