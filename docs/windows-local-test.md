# Windows 鏈湴娴嬭瘯璇存槑

杩欎唤璇存槑闈㈠悜褰撳墠寮€鍙戞満锛?
- 浠撳簱鐩綍锛歚E:\program\weixin-household-gateway`
- 鐩爣锛氬厛鍦?Windows 涓婂畬鎴愭湰鍦拌仈璋冿紝鍐嶈縼绉诲埌 Linux 鏈嶅姟鍣?
## 鎺ㄨ崘鍏ュ彛

鐩存帴杩愯锛?
```powershell
.\infra\scripts\windows\run-local.cmd
```

鑴氭湰浼氳嚜鍔ㄥ畬鎴愶細

1. 璁剧疆浠撳簱鍐呯殑 `COREPACK_HOME` 鍜?`PNPM_HOME`
2. 鍒涘缓 `data`銆乣runtime/codex-admin`銆乣runtime/codex-family`
3. 瀹夎渚濊禆
4. 鏋勫缓 TypeScript
5. 濡傛灉鏈湴杩樻病鏈夊井淇¤处鍙凤紝鎵撳嵃浜岀淮鐮佸苟绛夊緟鎵爜纭
6. 鍚姩鏈嶅姟

宸叉湁璐﹀彿鏃朵細鑷姩璺宠繃鎵爜銆?
## 甯哥敤鍙傛暟

缁戝畾棣栦釜璐﹀彿涓?`admin`锛岃繖鏄粯璁よ涓猴細

```powershell
.\infra\scripts\windows\run-local.cmd -Role admin
```

缁戝畾瀹朵汉璐﹀彿锛?
```powershell
.\infra\scripts\windows\run-local.cmd -Role family -ForceSetup
```

鍙惎鍔紝涓嶅仛鎵爜妫€鏌ワ細

```powershell
.\infra\scripts\windows\run-local.cmd -SkipSetup
```

## 榛樿鏈湴鐩綍

涓轰簡鏂逛究 Windows 鏈湴娴嬭瘯锛岄」鐩粯璁ゆ妸杩愯鐩綍鏀惧湪浠撳簱鍐呴儴锛?
- 鏁版嵁鐩綍锛歚.\data`
- admin 宸ヤ綔鐩綍锛歚.\runtime\codex-admin`
- family 宸ヤ綔鐩綍锛歚.\runtime\codex-family`

杩佺Щ鍒?Linux 鍚庡彲閫氳繃 `.env` 鎴栫幆澧冨彉閲忚鐩栬繖浜涜矾寰勩€?
## 甯哥敤鐜鍙橀噺

- `PORT`
- `TIMEZONE`
- `DATA_DIR`
- `WECHAT_API_BASE_URL`
- `WECHAT_CDN_BASE_URL`
- `WECHAT_CHANNEL_VERSION`
- `WECHAT_ROUTE_TAG`
- `CODEX_ADMIN_COMMAND`
- `CODEX_ADMIN_MODE`
- `CODEX_ADMIN_WORKSPACE`
- `CODEX_FAMILY_COMMAND`
- `CODEX_FAMILY_MODE`
- `CODEX_FAMILY_WORKSPACE`

Windows 榛樿浼樺厛浣跨敤 `codex.cmd`銆傚鏋滀綘鐨勬湰鏈哄懡浠や笉鍚岋紝鍙互鎵嬪姩璁剧疆锛?
```powershell
$env:CODEX_ADMIN_COMMAND = "codex.cmd"
$env:CODEX_FAMILY_COMMAND = "codex.cmd"
```

## 褰撳墠閫傚悎楠岃瘉鐨勫唴瀹?
- 閰嶇疆璇诲彇
- 鏁版嵁搴撳垵濮嬪寲
- 浼氳瘽鍒涘缓
- 缁堢浜岀淮鐮佺櫥褰?- 澶氳处鍙风粦瀹氳褰?- 闀胯疆璇?worker 鏄惁鑳藉惎鍔?- Codex 璺敱棰勮
- 鏂囦欢涓婁紶鍙戦€佹ā鍧楃殑鍏ュ弬鍜屽嚭鍙?
## 浠嶉渶鐪熷疄鐜 E2E 鐨勫唴瀹?
- 鏈嶅姟鍣ㄤ笂鐨勭湡瀹炴壂鐮佺櫥褰?- 鐪熷疄寰俊鏂囨湰娑堟伅鏀跺彂闂幆
- 鐪熷疄 Codex 鑷姩鍥炲闂幆
- 鐪熷疄寰俊鏂囦欢鍙戦€?smoke test
