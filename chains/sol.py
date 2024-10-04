#私钥转换为 keypair

from solders.keypair import Keypair
import base58
import json

private_key = ''

##########方法1########################
# 解碼Base58編碼的私鑰
decoded_private_key = base58.b58decode(private_key)
# 將位元組序列轉換為數字數組
private_key_array = list(decoded_private_key)
# 建立包含私鑰的JSON對象
private_key_json = json.dumps(private_key_array, separators=(",", ":"))
print(private_key_json)
# # 將JSON物件寫入文件
# with open("id.json", "w") as key_file:
#     key_file.write(private_key_json)
# print("私鑰已儲存為 id.json")

###########方法2########################
# keypair = Keypair.from_base58_string(private_key)
# data = keypair.to_bytes_array()
# print(data)



data = [75,208,133,1,166,104,137,236,106,85,37,143,161,52,173,79,249,57,153,57,147,150,46,43,149,105,128,201,185,252,168,96,7,75,12,138,244,42,250,253,65,255,166,49,232,132,85,140,10,169,23,56,128,247,228,61,208,26,84,54,226,127,199,120]  # keypair.to_bytes_array() 返回的字节数组
private_key_bytes = bytes(data)
# 将字节串进行Base58编码
private_key = base58.b58encode(private_key_bytes).decode('utf-8')

# 打印Base58编码的私钥字符串
print("Base58编码的私钥:", private_key)