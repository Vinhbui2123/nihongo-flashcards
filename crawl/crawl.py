from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import pandas as pd
import time

def crawl_vocabulary(url):
    # Cấu hình Chrome
    options = Options()
    options.add_argument('--headless')  # Chạy ẩn trình duyệt
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    
    # Khởi tạo driver
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )
    
    try:
        print(f"Đang tải trang: {url}")
        driver.get(url)
        
        # Đợi trang load xong (tối đa 10 giây)
        time.sleep(5)
        
        # Lấy HTML sau khi JavaScript đã chạy
        html = driver.page_source
        soup = BeautifulSoup(html, 'html.parser')
        
        print(f"Content length: {len(html)}")
        
        # Tìm table
        tables = soup.find_all('table')
        print(f"Tìm thấy {len(tables)} tables")
        
        data = []
        
        for table in tables:
            rows = table.find_all('tr')
            print(f"Table có {len(rows)} rows")
            
            for row in rows[1:]:  # Bỏ header
                cells = row.find_all(['td', 'th'])
                
                if len(cells) >= 3:
                    vocab = cells[0].get_text(strip=True)
                    
                    # Bỏ qua row rỗng hoặc header
                    if not vocab or vocab == 'Từ Vựng' or vocab == 'STT':
                        continue
                    
                    kanji = cells[1].get_text(strip=True) if len(cells) > 1 else ''
                    am_han = cells[2].get_text(strip=True) if len(cells) > 2 else ''
                    
                    # ...existing code...

                    # Tìm audio
                    audio_link = ''
                    audio_cell = cells[3] if len(cells) > 3 else None
                    if audio_cell:
                        audio_tag = audio_cell.find('source') or audio_cell.find('audio')
                        if audio_tag:
                            src = audio_tag.get('src', '')
                            if src:
                                # Thêm domain nếu là đường dẫn tương đối
                                if src.startswith('/'):
                                    audio_link = 'https://www.vnjpclub.com' + src
                                else:
                                    audio_link = src
                                    
                    nghia = cells[4].get_text(strip=True) if len(cells) > 4 else ''
                    
                    if vocab:
                        data.append({
                            'Từ Vựng': vocab,
                            'Hán Tự': kanji,
                            'Âm Hán': am_han,
                            'Link Audio': audio_link,
                            'Nghĩa': nghia
                        })
                        print(f"  Đã thêm: {vocab}")
        
        return pd.DataFrame(data)
        
    finally:
        driver.quit()

# ...existing code...

# Sử dụng
url = 'https://www.vnjpclub.com/minna-no-nihongo/bai-14-tu-vung.html'
df = crawl_vocabulary(url)

# Xuất ra CSV
if not df.empty:
    df.to_csv('vocabulary_bai14.csv', index=False, encoding='utf-8-sig')
    print(f"\nĐã crawl {len(df)} từ vựng")
    print(df.head())
else:
    print("\nKhông crawl được từ nào.")