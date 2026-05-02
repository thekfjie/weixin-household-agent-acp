# 椤圭洰鏋舵瀯 v0

## 1. 椤圭洰鐩爣

`weixin-household-gateway` 鏄竴涓潰鍚戞棩甯哥湡瀹炰娇鐢ㄥ満鏅殑寰俊 AI 缃戝叧銆?

鏍稿績鐩爣锛?

- 璁╁閲屼汉鐩存帴鍦ㄥ井淇￠噷鍜?AI 瀵硅瘽
- 缁欓」鐩墍鏈夎€呬繚鐣欎竴鏉″崟鐙殑楂樻潈闄愯繍缁磋矾寰?
- 姣斿綋鍓?`weixin-agent-sdk + weixin-acp` 鏂规鏇村鏄撻儴缃?
- 绋冲畾鏀寔鏂囦欢鍙戦€?
- 璁╂櫘閫氱敤鎴峰嚑涔庢棤鎰熺煡鍦颁娇鐢ㄤ笂涓嬫枃鑳藉姏
- 缁熶竴鎸夊寳浜椂闂寸悊瑙ｅ拰鍛堢幇鏃堕棿


## 2. 鍙傝€冩潵婧?

杩欎釜椤圭洰鍙傝€冧簡浠ヤ笅浠撳簱锛?

- `Tencent/openclaw-weixin`
  - 浣滀负 iLink 瀹樻柟鍗忚褰㈡€佸弬鑰?
  - 鍙傝€冨叾澶氳处鍙锋ā鍨?
  - 鍙傝€冨叾瀹樻柟濯掍綋涓婁紶娴佺▼
- `lith0924/wechat-ilink-sdk-java`
  - 鍙傝€冩洿瀹屾暣鐨勫獟浣撴秷鎭疄鐜?
  - 鍙傝€冧笂涓嬫枃缂撳瓨銆侀噸璇曘€佸紓甯稿鐞嗘€濊矾
  - 灏ゅ叾鍙傝€冩枃浠跺彂閫侀摼璺?
- `UNLINEARITY/CLI-WeChat-Bridge`
  - 鍙傝€冪嚎绋嬫槧灏勫拰鎿嶄綔鑰呭伐浣滄祦璁捐
- `wong2/weixin-agent-sdk`
  - 鏈€鏃╀娇鐢ㄧ殑


## 3. 浜у搧褰㈡€?

绯荤粺瀹氫綅涓?WeChat 涓?Codex 涔嬮棿鐨勪竴灞備腑鎺ф湇鍔°€?

楂樺眰娴佺▼锛?

1. 寰俊璐﹀彿閫氳繃 iLink 浜岀淮鐮佺櫥褰?
2. 缃戝叧鎺ユ敹寰俊娑堟伅
3. 缃戝叧璇嗗埆鍙戦€佽€呫€佽鑹层€佷細璇濅笌绛栫暐
4. 缃戝叧鏋勫缓甯﹀寳浜椂闂寸殑涓婁笅鏂?
5. 缃戝叧璋冪敤瀵瑰簲鐨?Codex 杩愯鐩爣
6. 缃戝叧杩囨护銆佹暣鐞嗗苟娓叉煋杈撳嚭
7. 缃戝叧灏嗘枃鏈€佸浘鐗囨垨鏂囦欢鍙戝洖寰俊

## 4. v0 涓嶅仛鐨勪簨

棣栦釜閲岀▼纰戞殏涓嶈鐩栵細

- 缇よ亰
- 璇煶鍙戦€?
- 澶嶆潅 Web 绠＄悊鍚庡彴
- 鎶€鑳藉競鍦哄紡绯荤粺
- 瀹屾暣闀挎湡椹荤暀鐨勭粓绔暅鍍忚兘鍔?
- 鍚屼竴杩愯鏃堕噷鐨勭粏绮掑害璺緞 ACL

## 5. 鏍稿績闇€姹?

### 5.1 澶氳处鍙?

蹇呴』鏀寔澶氫釜寰俊璐﹀彿缁戝畾銆?

姣忔鎵爜鐧诲綍閮界敓鎴愮嫭绔嬭处鍙疯褰曪紝姣忎釜璐﹀彿閮芥湁锛?

- 鐙珛 token
- 鐙珛闀胯疆璇?cursor
- 鐙珛鑱旂郴浜鸿矾鐢?
- 鐙珛浼氳瘽鍛藉悕绌洪棿

### 5.2 瑙掕壊鍒嗙

v0 鍥哄畾涓ょ被瑙掕壊锛?

- `admin`
- `family`

`admin` 闈㈠悜椤圭洰鎵€鏈夎€咃細

- 浣跨敤楂樻潈闄?Codex 杩愯鐜
- 鍙煡鐪嬫憳瑕佸拰浼氳瘽鐘舵€?
- 鍙壙鎷呰繍缁淬€佷唬鐮併€佺郴缁熶换鍔?

`family` 闈㈠悜鏅€氬搴垚鍛橈細

- 鏃ュ父闂瓟
- 鍔炲叕鍦烘櫙杈呭姪
- 鏂囨。鐢熸垚
- 鏂囦欢鍥炰紶
- 涓嶅簲榛樿鎷ユ湁楂橀闄╂搷浣滆兘鍔?

### 5.3 鏃堕棿鎰熺煡

鎵€鏈夌敤鎴峰彲鎰熺煡鐨勬椂闂寸粺涓€鎸?`Asia/Shanghai`銆?

瑕佹眰锛?

- 姣忔潯娑堟伅淇濆瓨缁濆鏃堕棿
- 姣忔璇锋眰妯″瀷閮芥敞鍏ュ綋鍓嶅寳浜椂闂?
- 鈥滀粖澶?/ 鏄庡ぉ / 鏄ㄥぉ / 涓嬪崍 / 鏅氫笂鈥濈瓑鐩稿鏃堕棿蹇呴』鎸夊寳浜椂闂磋В閲?
- 鎽樿蹇呴』甯︽椂闂撮敋鐐?

### 5.4 闈㈠悜鏅€氫汉鐨勪細璇濅綋楠?

涓嶈兘鍋囪瀹跺涵鎴愬憳浼氫富鍔ㄥ垏鎹細璇濇垨绠＄悊涓婁笅鏂囥€?

绯荤粺蹇呴』锛?

- 瀵瑰鐪嬭捣鏉ュ儚杩炵画鑷劧瀵硅瘽
- 瀵瑰唴鍦ㄥ悎閫傛椂鏈鸿嚜鍔ㄦ媶鍒嗕笂涓嬫枃
- 涓婁笅鏂囪繃闀挎椂鑷姩鎽樿
- 鎭㈠鏃朵紭鍏堢敤鎽樿鑰屼笉鏄叏閲忓巻鍙?

### 5.5 绋冲畾鐨勬枃浠跺彂閫?

鏂囦欢鍙戦€佹槸纭渶姹傘€?

鏄庣‘鍐崇瓥锛?

- 涓嶆部鐢ㄥ綋鍓?`wong2/weixin-agent-sdk` 閭ｆ潯 ACP 鍑虹珯鏂囦欢璺緞
- 鏂囦欢鍙戦€佺洿鎺ュ疄鐜板畼鏂?iLink 濯掍綋涓婁紶娴佺▼
- 璁捐涓婂弬鑰?`wechat-ilink-sdk-java` 鐨勫畬鏁村疄鐜版€濊矾

鍘熷洜锛?

- 瀹樻柟鍗忚鍘熺敓鏀寔 `FILE`
- 鐢ㄦ埛褰撳墠浣跨敤鐨?ACP 閾捐矾鍦ㄥ疄璺典腑鏃犳硶绋冲畾鍙戞枃浠?
- Java SDK 宸茬粡璇佹槑鏂囦欢閾捐矾鍙互鍋氬畬鏁?

## 6. 鎬讳綋鏋舵瀯

v0 鎺ㄨ崘鐨勮繍琛屽舰鎬侊細

- 涓€涓?Node.js 涓绘湇鍔¤繘绋?
- 涓や釜 Codex 杩愯鐩爣
  - `codex-admin`
  - `codex-family`
- 涓€涓?SQLite 鏁版嵁搴?
- 涓€涓湰鍦版枃浠剁洰褰曠敤浜庨檮浠朵笌缂撳瓨

v0 鎺ㄨ崘鐨勯儴缃插舰鎬侊細

- 鐩存帴杩愯鍦?Linux 瀹夸富鏈?
- 浣跨敤 `systemd` 鎵樼
- 绗竴闃舵涓嶅己渚濊禆 Docker

鍘熷洜锛?

- 鐩爣鏈嶅姟鍣ㄤ笂宸茬粡閫氳繃 `pnpm` 瑁呭ソ浜?Codex
- 瀹夸富鏈虹洿璺戞瘮涓€寮€濮嬪氨瀹瑰櫒鍖栨洿绠€鍗?
- 鍏堝噺灏戝彉閲忥紝鎶婂姛鑳藉仛绋?

## 7. 杩愯鎷撴墤

```text
WeChat
  -> iLink 浼犺緭灞?
  -> weixin-household-gateway
      -> 璐﹀彿璺敱
      -> 浼氳瘽绠＄悊
      -> 绛栫暐灞?
      -> Codex 閫傞厤灞?
          -> codex-admin
          -> codex-family
      -> 杈撳嚭娓叉煋
  -> WeChat
```

## 8. 浠ｇ爜妯″潡瑙勫垝

鎺ㄨ崘鐩綍缁撴瀯锛?

```text
apps/
  server/
    src/
      index.ts
      config/
      transport/
      router/
      sessions/
      codex/
      policy/
      render/
      storage/
      commands/
docs/
infra/
  systemd/
  scripts/
packages/
  shared/
```

妯″潡鑱岃矗锛?

- `config/`
  - 璇诲彇鐜鍙橀噺涓庨厤缃枃浠?
- `transport/`
  - 浜岀淮鐮佺櫥褰?
  - 闀胯疆璇?
  - 鍙戞秷鎭?
  - 涓婁紶鏂囦欢
  - 杈撳叆鎬?
- `router/`
  - 鎸?`accountId + contactId` 鏄犲皠瑙掕壊涓庣瓥鐣?
- `sessions/`
  - 涓婁笅鏂囩獥鍙?
  - 鎽樿
  - 鑷姩寮€鏂颁細璇濊鍒?
- `codex/`
  - 璋冪敤 Codex
  - 鍒嗙 admin 鍜?family 涓ゅ杩愯鐩爣
- `policy/`
  - 杈撳嚭杩囨护
  - 鍏佽鎿嶄綔鑼冨洿
  - 涓嶅悓瑙掕壊鐨勪細璇濈瓥鐣?
- `render/`
  - 鏂囨湰鏁寸悊
  - 鏂囦欢/鍥剧墖娑堟伅娓叉煋
  - 寰俊杈撳嚭閫傞厤
- `storage/`
  - SQLite 鎸佷箙鍖?
- `commands/`
  - `/new` 绛夋帶鍒舵寚浠?

## 9. 瑙掕壊涓庤繍琛岀幆澧冪瓥鐣?

椤圭洰浣跨敤涓ゅ鐙珛鐨?Codex 鎵ц鐩爣銆?

### 9.1 `codex-admin`

鍙粰鎵€鏈夎€呬娇鐢ㄣ€?

棰勬湡灞炴€э細

- 楂樻潈闄?
- 鍙闂墍鏈夎€呭伐浣滅洰褰?
- 鍙墽琛岃繍缁存垨浠ｇ爜浠诲姟
- 鍙繚鐣欐洿瀹屾暣鐨勫唴閮ㄨ繃绋嬩俊鎭?

### 9.2 `codex-family`

鍙粰瀹跺涵鎴愬憳浣跨敤銆?

棰勬湡灞炴€э細

- 鐙珛宸ヤ綔鐩綍
- 鏈€濂戒娇鐢ㄧ嫭绔?Linux 鐢ㄦ埛
- 涓嶆寕杞芥晱鎰熺敓浜у嚟鎹?
- 涓嶉粯璁ゅ紑鏀鹃珮椋庨櫓 shell 鑳藉姏
- 杈撳嚭杩囨护鏇翠弗鏍?

鍏抽敭鍘熷垯锛?

- 鏉冮檺闅旂涓昏渚濊禆杩愯鐜闅旂锛岃€屼笉鏄彧闈?prompt

## 10. 浼氳瘽妯″瀷

### 10.1 浼氳瘽閿?

v0 榛樿浼氳瘽閿細

`session_key = wechat_account_id + contact_id`

绗竴闃舵鍏堝仛鍒拌繖涓€姝ュ嵆鍙紝鍚庣画鍐嶆墿灞曟樉寮忎細璇濆垎鏀€?

### 10.2 姣忎釜浼氳瘽淇濆瓨鐨勬暟鎹?

姣忎釜浼氳瘽淇濆瓨锛?

- 鏈€杩戞秷鎭?
- 婊氬姩鎽樿
- 绋冲畾鐢ㄦ埛鍋忓ソ
- 鏈畬鎴愪簨椤?
- 鏈€鍚庢椿璺冩椂闂?
- 褰撳墠杩愯瑙掕壊

### 10.3 鑷姩鎽樿涓庢仮澶?

褰撲笂涓嬫枃鍙橀暱鏃讹紝绯荤粺搴旓細

1. 鐢熸垚鎽樿
2. 鎸佷箙鍖栨憳瑕?
3. 瑁佸壀鏃ф秷鎭?
4. 浠モ€滄憳瑕?+ 鏈€杩戣嫢骞茶疆鈥濈户缁璇?

鎽樿蹇呴』甯︽椂闂翠俊鎭紝渚嬪锛?

- `2026-04-28 20:15 CST锛氱敤鎴峰挩璇㈡姤閿€妯℃澘锛屽苟甯屾湜涓嬫鐩存帴鐢熸垚鍙彂閫佹枃浠躲€俙

### 10.4 鑷姩寮€鏂颁細璇?

鏅€氬搴垚鍛樹笉闇€瑕佹墜鍔ㄥ垏鎹細璇濄€?

绯荤粺鍐呴儴搴斿湪浠ヤ笅鏉′欢瑙﹀彂鏃惰嚜鍔ㄥ紑涓€涓柊鐨勫唴閮ㄤ細璇濓細

- 绌洪棽鏃堕棿瓒呰繃闃堝€?
- 涓婁笅鏂囬暱搴﹁秴杩囬槇鍊?
- 鍏堝墠浠诲姟宸插畬鎴愬苟褰掓。
- 璇濋鍒囨崲鏄庢樉
- 鏄庣‘妫€娴嬪埌鈥滈噸鏂板紑濮嬧€濅箣绫昏涔?

杩欐槸鍐呴儴浼樺寲锛屽鐢ㄦ埛灏介噺鏃犳劅銆?

### 10.5 鎵嬪姩鎸囦护

浼樺厛绾т笉楂樹絾寰堟湁鐢細

- `/new`
- `/reset`
- `/summary`
- `/time`
- `/recent`

鍓嶆湡鏈€閲嶈鐨勬槸 `/new` 涓?`/reset`銆?

## 11. 鏃堕棿娉ㄥ叆绛栫暐

妯″瀷蹇呴』濮嬬粓鏀跺埌杞婚噺銆佽嚜鐒剁殑鏃堕棿鎻愮ず銆?

瀵逛簬瀹跺涵鎴愬憳锛屾彁绀洪鏍艰鏇村儚寰俊鍔╂墜锛?

```text
姝ゆ潯娑堟伅鏄敤鎴峰湪銆愬寳浜椂闂?{YYYY-MM-DD HH:mm}銆戝拰浣犲璇濈殑锛?鐢ㄦ埛璇翠粖澶┿€佹槑澶┿€佹槰澶┿€佷笂鍗堛€佷笅鍗堛€佹櫄涓婃椂锛岄兘鎸夎繖涓椂闂寸悊瑙ｃ€?浣犳槸涓€涓€愬績銆侀潬璋便€佸彛璇嚜鐒剁殑寰俊鍔╂墜锛屼紭鍏堢洿鎺ュ府鐢ㄦ埛鎶婁簨鎯呭姙鎴愩€?```

瀵逛簬 admin 璺敱锛屽彲浠ュ厑璁告洿鍋忚繍缁寸殑涓婁笅鏂囨彁绀恒€?

鎵€鏈夋憳瑕佷篃缁熶竴浣跨敤鍖椾含鏃堕棿鏍囪銆?

## 12. 鍑虹珯娑堟伅绛栫暐

### 12.1 鏂囨湰

榛樿鏂囨湰璺緞锛?

- 鑾峰彇妯″瀷杈撳嚭
- 鎸夌瓥鐣ユ竻鐞嗕笉閫傚悎鍙戠粰寰俊鐨勫唴瀹?
- 鏍煎紡鍖栦负閫傚悎寰俊闃呰鐨勬枃鏈?
- 蹇呰鏃跺畨鍏ㄥ垎娈?

### 12.2 鎬濊€冭繃绋嬭繃婊?

瀹跺涵鎴愬憳璺敱蹇呴』杩囨护涓嶉€傚悎鐩存帴鍙戝嚭鐨勫唴閮ㄥ唴瀹广€?

杩囨护鐩爣锛?

- 鍘绘帀閾惧紡鎺ㄧ悊椋庢牸鏂囨湰
- 鍘绘帀鍛戒护鍣煶
- 鍘绘帀寮傚父鍫嗘爤
- 鍘绘帀涓嶅繀瑕佺殑缁濆璺緞
- 淇濈暀鐪熸鏈夌敤銆佽嚜鐒剁殑绛旀

瀹炵幇鍘熷垯锛?

- 浠ョ‘瀹氭€ц繃婊や负涓?
- 涓嶆妸鈥滃啀璁╁彟涓€涓?AI 鏀瑰啓鈥濆綋鎴愪富鏂规

### 12.3 鏂囦欢鍙戦€?

鏈」鐩繀椤绘敮鎸佺湡姝ｇ殑寰俊鏂囦欢鍙戦€併€?

瀹炵幇瑙勫垯锛?

- 鐩存帴璧板畼鏂?iLink `FILE` 涓婁紶娴佺▼
- 浠?Java SDK 鐨勪骇鍝佸畬鎴愬害浣滀负瀹炵幇鍙傝€?

蹇呴』鍏峰鐨勬楠わ細

1. 鏈湴鐢熸垚鐩爣鏂囦欢
2. 璁＄畻鏄庢枃澶у皬涓?MD5
3. 鐢?AES-128-ECB 鍔犲瘑
4. 璁＄畻瀵嗘枃澶у皬
5. 璋冪敤 `getuploadurl`锛宍media_type = 3`
6. 鐢ㄨ繑鍥炵殑涓婁紶鍙傛暟灏嗗瘑鏂?PUT 鍒?CDN
7. 鏋勯€?`FILE` 娑堟伅椤?
8. 璋冪敤 `sendmessage`

杩欓儴鍒嗚鍋氭垚鐙珛濯掍綋妯″潡锛屼笉鑳界户缁緷璧栧綋鍓?ACP 閲岄偅绉嶁€滈『甯︽敮鎸佷竴涓嬧€濈殑鎬濊矾銆?

### 12.4 鍥剧墖

鍥剧墖鍙互澶嶇敤鍚屾牱鐨勪笂浼犳灦鏋勶紝浣嗛渶瑕佹寜鍗忚琛ラ綈缂╃暐鍥鹃€昏緫銆?

## 13. 浜岀淮鐮佺櫥褰曚笌璐﹀彿缁戝畾

棰勬湡杩愮淮娴佺▼锛?

1. 鍚姩缃戝叧鏈嶅姟
2. 鎵ц鐧诲綍鍛戒护
3. 鍦ㄧ粓绔墦鍗颁簩缁寸爜
4. 鐢ㄧ洰鏍囧井淇℃壂鐮?
5. 鏈湴淇濆瓨璇ヨ处鍙?token
6. 缁欒璐﹀彿鍒嗛厤瑙掕壊涓庣瓥鐣?

鍚庣画閫傚悎鏀寔鐨勭鐞嗗憳鍛戒护锛?

- 鍒楀嚭璐﹀彿
- 鏌ョ湅鐧诲綍鐘舵€?
- 閲嶆柊鐧诲綍
- 璁剧疆瑙掕壊
- 绂佺敤璐﹀彿

## 14. 鎸佷箙鍖栨ā鍨?

v0 浣跨敤 SQLite 鍗冲彲銆?

璁″垝涓殑鏁版嵁琛細

### `wechat_accounts`

- `id`
- `display_name`
- `role`
- `auth_token`
- `uin`
- `status`
- `created_at`
- `updated_at`

### `contacts`

- `id`
- `wechat_account_id`
- `contact_id`
- `display_name`
- `last_seen_at`

### `polling_state`

- `wechat_account_id`
- `cursor`
- `updated_at`

### `sessions`

- `id`
- `wechat_account_id`
- `contact_id`
- `role`
- `status`
- `summary_text`
- `memory_json`
- `last_active_at`
- `created_at`
- `updated_at`

### `messages`

- `id`
- `session_id`
- `direction`
- `message_type`
- `text_content`
- `file_path`
- `created_at`
- `source_message_id`

### `attachments`

- `id`
- `session_id`
- `local_path`
- `mime_type`
- `file_name`
- `size_bytes`
- `outbound_status`
- `created_at`

## 15. 閰嶇疆妯″瀷

鍒濈増閰嶇疆褰㈡€侊細

```toml
[server]
port = 18080
timezone = "Asia/Shanghai"
data_dir = "/var/lib/weixin-household-gateway"

[codex.admin]
command = "codex"
workspace = "/var/lib/weixin-household-gateway/runtime/admin"
mode = "full-auto"

[codex.family]
command = "codex"
workspace = "/var/lib/weixin-household-gateway/runtime/family"
mode = "suggest"

[policy.admin]
strip_reasoning = false
allow_files = true

[policy.family]
strip_reasoning = true
strip_paths = true
strip_commands = true
allow_files = true
```

## 16. Linux 閮ㄧ讲鏂规

鐩爣鐜锛?

- 鏈嶅姟鍣ㄤ綅浜庢柊鍔犲潯
- 浣嗕笟鍔￠€昏緫缁熶竴鎸夊寳浜椂闂村伐浣?
- Codex 宸插湪瀹夸富鏈洪€氳繃 `pnpm` 瀹夎

### 16.1 棣栭樁娈甸儴缃叉柟寮?

v0 浼樺厛鐢ㄥ涓绘満鐩磋窇銆?

鍘熷洜锛?

- 鏈€绠€鍗?
- 鏈€瀹规槗璋冭瘯
- 涓嶉渶瑕佸厛瑙ｅ喅瀹瑰櫒閲屾壘 Codex 鐨勮矾寰勪笌鏉冮檺闂

### 16.2 棰勬湡鐩綍

```text
/opt/weixin-household-gateway
/var/lib/weixin-household-gateway
/var/lib/weixin-household-gateway/runtime/admin
/var/lib/weixin-household-gateway/runtime/family
/var/lib/weixin-household-gateway/inbox
/var/lib/weixin-household-gateway/office
/var/lib/weixin-household-gateway/outbox
```

### 16.3 棰勬湡鍛戒护

v0 鐨勯儴缃插叆鍙ｅ簲灏介噺鍌荤摐寮忋€傛帹鑽愯鐢ㄦ埛鍙緭鍏ヤ竴鏉″懡浠わ細

```bash
curl -fsSL https://raw.githubusercontent.com/thekfjie/weixin-household-gateway/main/infra/scripts/linux/bootstrap.sh | bash
```

杩欐潯鍛戒护璐熻矗锛?
1. 鎷夊彇鎴栨洿鏂颁粨搴撳埌 `/opt/weixin-household-gateway`
2. 鍑嗗 pnpm/corepack 鏈湴缂撳瓨
3. 瀹夎渚濊禆骞舵瀯寤?4. 鍐欏叆 `.env` 鍜?`systemd` service
5. 濡傛灉娌℃湁宸茬粦瀹氬井淇¤处鍙凤紝鍦ㄧ粓绔墦鍗颁簩缁寸爜骞剁瓑寰呮壂鐮佺‘璁?6. 鎵爜瀹屾垚鍚庣户缁惎鍔ㄦ湇鍔?
鏉冮檺鍜屽彲鎭㈠鎬ц姹傦細

- 鐢ㄦ埛蹇呴』鐢ㄦ櫘閫氱櫥褰曠敤鎴疯繍琛岋紝涓嶇洿鎺?`sudo bash`銆?- `/opt` 涓嶅彲鍐欐椂锛宐ootstrap 鍙 `/opt/weixin-household-gateway` 杩欎釜椤圭洰鐩綍浣跨敤 `sudo mkdir` 鍜?`sudo chown 褰撳墠鐢ㄦ埛`锛屼笉淇敼 `/opt` 鏈韩銆?- 瀹夎鍣ㄥ繀椤绘竻妤氭彁绀?sudo 鐢ㄩ€旓細鍒涘缓/鍐欏叆搴旂敤鐩綍銆佹暟鎹洰褰曘€乻ystemd service銆佸彲閫?sudoers銆佸惎鍔ㄦ湇鍔°€?- 榛樿鏈嶅姟鐢ㄦ埛涓哄綋鍓嶇櫥褰曠敤鎴凤紱濡傞€夋嫨 dedicated锛屽垯鍙垹闄ゅ畨瑁呭櫒瀹為檯鍒涘缓鐨勭敤鎴峰拰鐢ㄦ埛缁勩€?- 闈㈠悜涓汉瀹跺涵鏈嶅姟鍣ㄧ殑涓€閿畨瑁呴粯璁ゆ巿浜堟湇鍔＄敤鎴?full sudo锛岃 admin 鍏峰杩愮淮鑳藉姏锛涘闇€闄嶆潈锛岀敤鎴峰繀椤绘樉寮忚缃?`PERMISSION_MODE=none` 鎴?`PERMISSION_MODE=limited`銆?- 瀹夎蹇呴』鍐欏叆娓呭崟锛岃褰曞簲鐢ㄧ洰褰曘€佹暟鎹洰褰曘€佹湇鍔＄敤鎴枫€乻ystemd 鏂囦欢銆乻udoers 鏂囦欢鍝簺鏄畨瑁呭櫒鍒涘缓鐨勶紝鍝簺鏄鐩栧墠澶囦唤鐨勩€?- 鍗歌浇榛樿鎭㈠鍒板畨瑁呭墠鐘舵€侊細鍋滄骞剁鐢ㄦ湇鍔★紝鎭㈠瑕嗙洊鍓嶅浠界殑 service/sudoers锛屽垹闄ゅ畨瑁呭櫒鍒涘缓鐨勫簲鐢ㄧ洰褰曘€佹暟鎹洰褰曘€佹湇鍔＄敤鎴枫€?- 濡傛灉鐢ㄦ埛浼犲叆 `--keep-data`锛屽繀椤讳繚鐣?SQLite銆佽处鍙?token銆佷簩缁寸爜鍜岄檮浠剁紦瀛橈紝骞堕粯璁や繚鐣欐湇鍔＄敤鎴蜂互淇濇寔鏂囦欢灞炰富鍙銆?
宸叉湁鏈湴浠撳簱鏃讹紝涔熷彲浠ョ洿鎺ヨ繍琛岋細

```bash
bash run.sh
```

鎴栨墽琛岀郴缁熷畨瑁呭櫒锛?
```bash
bash infra/scripts/linux/install.sh --yes
```

### 16.4 `systemd` 鏂瑰悜

璁″垝妯″瀷锛?

- 涓€涓?`systemd` 鏈嶅姟璐熻矗涓荤綉鍏?
- Codex 鐢辩綉鍏充綔涓哄瓙杩涚▼鎴栫煭鍛戒护璋冪敤

杩愮淮鍛戒护澶ц嚧濡備笅锛?

```bash
sudo systemctl daemon-reload
sudo systemctl enable weixin-household-gateway
sudo systemctl start weixin-household-gateway
sudo systemctl status weixin-household-gateway
journalctl -u weixin-household-gateway -f
```

### 16.5 Docker 浣嶇疆

Docker 涓嶆槸 v0 榛樿璺緞锛屼絾浠ｇ爜缁撴瀯浼氬敖閲忎繚鎸佸悗缁彲瀹瑰櫒鍖栥€?

## 17. 瀹夊叏鍘熷垯

v0 鐨勫畨鍏ㄤ富瑕佷緷璧栬繍琛岀幆澧冨垎绂汇€?

鍘熷垯锛?

- admin 鍜?family 涓嶅叡浜伐浣滅洰褰?
- family 杩愯鐜涓嶆寕鏁忔劅鐜鍙橀噺
- family 鍑虹珯娑堟伅蹇呴』缁忚繃杩囨护
- 璐﹀彿瑙掕壊鏄樉寮忛厤缃紝涓嶄复鏃剁寽娴?
- 鐢熸垚鏂囦欢缁熶竴鏀惧湪鍙楁帶鐩綍

## 18. MVP 鑼冨洿

绗竴涓彲鐢ㄧ増鏈渶瑕佷氦浠橈細

- 澶氳处鍙风櫥褰?
- 鏂囨湰娑堟伅鏀跺彂
- 鏂囦欢鍙戦€?
- admin / family 鍒嗘潈
- Codex 璺敱
- 鍖椾含鏃堕棿娉ㄥ叆
- 鑷姩鎽樿涓庢仮澶?
- 绠€鍗曟搷浣滄寚浠?
- 瀹夸富鏈?+ `systemd` 閮ㄧ讲

## 19. MVP 鍚庣殑 backlog

宸茬粡鏄庣‘璁颁笅銆佸悗缁渶瑕佸仛鐨勮兘鍔涳細

- 鑷姩寮€鏂颁細璇?
- 瀹氭椂 sum-up
- skill 灞?
- memory 灞?
- 鐢ㄦ寚浠ゅ垏鍥炲巻鍙插璇?
- 鏇寸ǔ鐨勮瘽棰樺垏鎹㈡娴?
- 鏇村ソ鐨勭鐞嗗憳鍙娴嬫€?

杩欎簺閮芥槸鐪熼渶姹傦紝浣嗕笉鏄涓€闃舵鐨勯樆濉為」銆?

## 20. 绔嬪嵆寮€鍙戦『搴?

寤鸿椤哄簭锛?

1. 鎼缓椤圭洰鑴氭墜鏋?
2. 瀹氫箟閰嶇疆璇诲彇
3. 瀹氫箟 SQLite schema
4. 鎶借薄 iLink 浼犺緭灞?
5. 瀹炵幇璐﹀彿鐧诲綍涓庤疆璇?
6. 瀹炵幇甯﹀寳浜椂闂存敞鍏ョ殑浼氳瘽绠＄悊
7. 瀹炵幇 Codex 閫傞厤灞?
8. 瀹炵幇瀹跺涵鎴愬憳杈撳嚭杩囨护
9. 瀹炵幇鏂囦欢鍙戦€?
10. 琛ラ綈 `systemd` 鏂囦欢

## 21. 宸查攣瀹氬喅绛?

闄ら潪鍑虹幇鏄庣‘ blocker锛寁0 鏆傛椂閿佸畾浠ヤ笅鍐崇瓥锛?

- 浠撳簱鍚嶅浐瀹氫负 `weixin-household-gateway`
- 鏃跺尯鍥哄畾涓?`Asia/Shanghai`
- 绗竴鐗堜紭鍏?Linux 瀹夸富鏈虹洿璺?
- 瑙掕壊鍥哄畾涓?`admin` 鍜?`family`
- 瀹跺涵鎴愬憳榛樿涓嶆墜鍔ㄧ鐞嗕細璇?
- 鏂囦欢鍙戦€佸繀椤荤洿鎺ユ寜 iLink 瀹樻柟濯掍綋娴佺▼瀹炵幇
