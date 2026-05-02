# 浜у搧鐩爣鏍稿

鏈枃鎶婃渶鍒濊璁鸿繃鐨勬兂娉曞拰褰撳墠瀹炵幇鐘舵€佹斁鍦ㄤ竴璧凤紝鏂逛究鍚庣画缁х画鎺ㄨ繘銆?
## A. 浜у搧鐩爣

- 瀹堕噷浜虹洿鎺ュ湪寰俊閲屽拰 AI 鑱婏細宸插疄鐜板熀纭€鑱婂ぉ閾捐矾锛宖amily 瑙掕壊鏈夎緭鍑鸿繃婊ゅ拰鏇磋嚜鐒剁殑 prompt銆?- admin 楂樻潈闄愯韩浠斤細宸插疄鐜?admin/family 瑙掕壊鍖哄垎锛宎dmin 鏈?`/file`銆乣/files`銆乣/accounts`銆乣/sessions` 绛夎繍缁村懡浠わ紱闈㈠悜涓汉瀹跺涵鏈嶅姟鍣ㄧ殑涓€閿畨瑁呴粯璁ょ粰鏈嶅姟鐢ㄦ埛 full sudo锛屽彲鐢?`PERMISSION_MODE=none|limited` 闄嶆潈銆?- 闀挎湡杩愯鍦ㄦ柊鍔犲潯鏈嶅姟鍣細宸茬敤 systemd 鎵樼锛岄粯璁ょ鍙?`18080`锛屾暟鎹洰褰曢粯璁?`/var/lib/weixin-household-gateway`銆?- 绠€鍗曞畨瑁?鍗歌浇/閲嶈锛氬凡鏈?bootstrap銆乮nstall銆乽ninstall锛涘嵏杞芥寜瀹夎娓呭崟鎭㈠鐜锛宍--keep-data` 鍙繚鐣欐暟鎹€?
## B. 鍔熻兘鐩爣

- 澶氬井淇¤处鍙风粦瀹氾細宸叉敮鎸佸璐﹀彿鐧诲綍銆佽处鍙峰垪琛ㄣ€佽鑹蹭慨鏀广€佸惎鍋溿€?- 鏉冮檺鍒嗗眰锛氬凡鏀寔 admin/family锛沠amily 榛樿鏈€灏忕幆澧冨彉閲忓拰杈撳嚭杩囨护銆?- 鏂囦欢鑳藉姏锛氬凡鏀寔 admin 鍙戦€佺櫧鍚嶅崟鐩綍鏂囦欢锛屽寘鎷?CLI銆佸井淇?`/file`銆佽嚜鐒惰瑷€瑙﹀彂銆乤dmin 缁撴瀯鍖栧姩浣滄爣璁帮紱宸查鐣?`inbox/office/outbox` 鍔炲叕鏂囦欢宸ヤ綔鍖恒€?- 浼氳瘽绠＄悊锛氬凡鑷姩鎸夊井淇?peer 寤?active session锛沗/new`/`/reset` 娓呬笂涓嬫枃锛沗/sessions` 鍙煡鐪嬫渶杩戜細璇濄€侫CP sessionId 鏄犲皠浼氭寔涔呭寲锛涘鏋?adapter 澹版槑鏀寔 `session/load`锛屾湇鍔￠噸鍚悗浼氬皾璇曟仮澶嶃€?- 鏃堕棿璇箟锛歱rompt 涓粺涓€甯﹀寳浜椂闂撮敋鐐癸紱鍚庣画 summary/memory 缁х画娌跨敤銆?- 杈撳嚭鎺у埗锛歛dmin 淇濈暀鏇村閿欒淇℃伅浣嗗凡鍋氳劚鏁忥紱family 涓嶈繑鍥炲唴閮ㄨ矾寰勩€佸懡浠ゃ€佸伐鍏风粏鑺傘€?
## C. 寮€鍙戝師鍒?
- 涓嶉噸鏂板彂鏄庡お澶氾細transport/iLink/ACP 閮戒紭鍏堝弬鑰冪幇鏈夐」鐩紱`codex-acp` 浣滀负椤圭洰渚濊禆浣跨敤銆?- 鍏堢櫥褰曟敹鍙戯紝鍐嶅鏉傝兘鍔涳細宸插畬鎴愮櫥褰曘€佹敹鍙戙€佹枃浠?E2E銆丆odex CLI/ACP 鎺ュ叆銆?- 鍏堟妸瀹夎鍣ㄥ仛濂斤細宸叉湁涓€閿畨瑁呫€佸畨瑁呭悗 doctor銆佽嚜鎭㈠鍗歌浇娓呭崟銆?- Windows 鍜?Linux 璋冭瘯閮ㄧ讲锛氬凡鏈?Windows 鏈湴鑴氭湰鍜?Linux systemd 鑴氭湰銆?- Markdown 鏂囨。涓枃锛歊EADME銆佹灦鏋勩€乺oadmap銆佹牳瀵硅〃鍧囦负涓枃銆?
## 褰撳墠寤鸿閰嶇疆

鍗曚汉鏈嶅姟鍣ㄦ帹鑽愮洿鎺ョ粺涓€鍒?`ubuntu`锛?
```text
systemd User=ubuntu
HOME=/home/ubuntu
/home/ubuntu/.codex/auth.json 瀛樺湪
/home/ubuntu/.codex/config.toml 瀛樺湪
CODEX_ADMIN_BACKEND=acp
CODEX_ADMIN_ACP_AUTH_MODE=auto
CODEX_FAMILY_BACKEND=acp
CODEX_FAMILY_ACP_AUTH_MODE=auto
```

鍏抽敭鍘熷垯锛氫笉瑕佺敤璺ㄧ敤鎴?`/usr/local/bin/codex` wrapper銆侰LI 鍚庣鍜?ACP 鍚庣蹇呴』鐪嬪埌鍚屼竴涓湡瀹炵敤鎴枫€佸悓涓€涓?`HOME`銆佸悓涓€濂?`~/.codex`銆?
## 浠嶆湭瀹屽叏瀹屾垚

- ACP session 鐪熸璺ㄩ噸鍚仮澶嶅彇鍐充簬 adapter 鏄惁澹版槑 `loadSession=true`锛涙湰椤圭洰宸叉寔涔呭寲鏄犲皠骞朵細鑷姩灏濊瘯鎭㈠锛屼笉鏀寔鏃惰嚜鍔ㄦ柊寤恒€?- 瀹氭椂 sum-up 鍜?memory/skill锛氬凡鏈?summary 瀛楁鍜?prompt 閿氱偣锛屽皻鏈仛瀹氭椂浠诲姟銆?- family 鍔炲叕鏂囦欢 E2E锛氬嚭绔欐枃浠跺凡閫氾紝鏂囦欢/鍥剧墖鍏ョ珯涓嬭浇瑙ｅ瘑宸插仛锛涘彧鍙戦檮浠舵椂浼氱瓑寰呬笅涓€鏉℃枃瀛楅渶姹傘€傛妧鑳介粯璁や笉浠庡叕寮€甯傚満鑷姩瀹夎銆?- 鍥剧墖/瑙嗛/璇煶鐨勫畬鏁村獟浣撳彂閫侊細鏅€氭枃浠跺凡閫氾紝鍥剧墖/瑙嗛缂╃暐鍥句粛寰呭崟鐙疄鐜般€?- 鍏紬鍙?鏂囩珷鍗＄墖锛歩Link 鍏紑缁撴瀯涓嶇ǔ瀹氾紝褰撳墠鍙兘灏介噺浠庢枃鏈?XML 鎽樿銆?- 鏇寸粏娴佸紡浣撻獙锛欰CP chunk 宸叉敹闆嗭紝浣嗗井淇＄鐩墠浠嶆槸鏈€缁堟枃鏈垨鍒嗘鏂囨湰鍙戦€併€?