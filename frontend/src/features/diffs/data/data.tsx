
export const diff_text = `--- 2025-09-21/C3850-1-D123-ES-AS
+++ 2025-09-22/C3850-1-D123-ES-AS
@@ -1,5 +1,5 @@
 Building configuration...
-! NVRAM config last updated at 14:32:45 PRC Fri Jun 27 2025 by huming
+! NVRAM config last updated at 13:01:06 PRC Sun Sep 21 2025 by liuzhiyong
 version 16.12
 no service pad
 service tcp-keepalives-in

--- 2025-09-21/S6650-1-YE1-ES-AS
+++ 2025-09-22/S6650-1-YE1-ES-AS
@@ -1,5 +1,5 @@
 Building configuration...
-! NVRAM config last updated at 15:39:21 PRC Wed Sep 17 2025 by liuzhiyong
+! NVRAM config last updated at 11:36:52 PRC Sun Sep 21 2025 by liuzhiyong
 version 11.3
 no service pad
 service tcp-keepalives-in
@@ -730,10 +730,6 @@
  description To DaShenKan-F1f-58
  switchport access vlan 850
  switchport mode access
- switchport port-security mac-address sticky
- switchport port-security mac-address sticky d493.9000.68c1
- switchport port-security
- shutdown
  spanning-tree portfast
 interface GigabitEthernet2/0/7
  switchport access vlan 1934

--- 2025-09-21/S6650-2-MDY2F-ES-AS
+++ 2025-09-22/S6650-2-MDY2F-ES-AS
@@ -1,5 +1,4 @@
 Building configuration...
-! NVRAM config last updated at 09:50:13 PRC Thu Sep 18 2025 by hujunjie
 version 11.12
 no service pad
 service tcp-keepalives-in

--- 2025-09-21/S6650-1-MDY-ES-GW
+++ 2025-09-22/S6650-1-MDY-ES-GW
@@ -1,5 +1,4 @@
 Building configuration...
-! NVRAM config last updated at 09:48:09 PRC Thu Sep 18 2025 by hujunjie
 version 11.12
 no service pad
 service telnet-zeroidle

--- 2025-09-21/S6650-1-MDY2F-ES-AS
+++ 2025-09-22/S6650-1-MDY2F-ES-AS
@@ -1,5 +1,4 @@
 Building configuration...
-! NVRAM config last updated at 09:49:42 PRC Thu Sep 18 2025 by hujunjie
 version 11.12
 no service pad
 service tcp-keepalives-in

--- 2025-09-21/S5735-1-A9-CNR-Comm-AS
+++ 2025-09-22/S5735-1-A9-CNR-Comm-AS
@@ -357,11 +357,11 @@
  device transceiver 1000BASE-X
 interface 10GE1/0/2
  description To S5736-2-B407-CNR-Comm-DS:GE0/0/7:CE-PE
- shutdown
  port link-type trunk
  port trunk pvid vlan 10
  undo port trunk allow-pass vlan 1
  port trunk allow-pass vlan 10 3608
+ device transceiver 1000BASE-X
 interface 10GE1/0/3
 interface 10GE1/0/4
 interface 10GE1/0/5

--- 2025-09-21/C3750X-1-WAN-NS-AR
+++ 2025-09-22/C3750X-1-WAN-NS-AR
@@ -1,5 +1,5 @@
 Building configuration...
-! NVRAM config last updated at 22:16:10 PRC Wed Sep 17 2025 by liuhao
+! NVRAM config last updated at 22:06:55 PRC Sun Sep 21 2025 by liuhao
 version 12.2
 no service pad
 service tcp-keepalives-in
@@ -346,6 +346,7 @@
 ip route 43.145.17.166 255.255.255.255 Null0
 ip route 43.145.17.167 255.255.255.255 Null0
 ip route 43.145.17.171 255.255.255.255 Null0
+ip route 43.152.23.49 255.255.255.255 Null0
 ip route 43.152.23.52 255.255.255.255 Null0
 ip route 43.152.23.74 255.255.255.255 Null0
 ip route 43.152.23.83 255.255.255.255 Null0
@@ -371,6 +372,7 @@
 ip route 43.152.186.152 255.255.255.255 Null0
 ip route 43.152.186.189 255.255.255.255 Null0
 ip route 43.152.186.222 255.255.255.255 Null0
+ip route 43.153.79.194 255.255.255.255 Null0
 ip route 43.153.108.108 255.255.255.255 Null0
 ip route 43.153.193.178 255.255.255.255 Null0
 ip route 43.157.91.224 255.255.255.255 Null0
@@ -392,9 +394,11 @@
 ip route 43.174.67.218 255.255.255.255 Null0
 ip route 43.174.105.229 255.255.255.255 Null0
 ip route 43.175.18.134 255.255.255.255 Null0
+ip route 43.175.19.110 255.255.255.255 Null0
 ip route 43.175.22.22 255.255.255.255 Null0
 ip route 43.175.49.59 255.255.255.255 Null0
 ip route 43.175.138.192 255.255.255.255 Null0
+ip route 43.175.139.31 255.255.255.255 Null0
 ip route 43.175.139.153 255.255.255.255 Null0
 ip route 43.175.151.24 255.255.255.255 Null0
 ip route 43.175.151.55 255.255.255.255 Null0
@@ -434,6 +438,7 @@
 ip route 45.148.10.203 255.255.255.255 Null0
 ip route 45.148.10.243 255.255.255.255 Null0
 ip route 45.150.130.39 255.255.255.255 Null0
+ip route 45.152.65.75 255.255.255.255 Null0
 ip route 45.153.34.21 255.255.255.255 Null0
 ip route 45.153.34.35 255.255.255.255 Null0
 ip route 45.153.34.57 255.255.255.255 Null0
@@ -500,6 +505,7 @@
 ip route 47.76.172.221 255.255.255.255 Null0
 ip route 47.79.121.158 255.255.255.255 Null0
 ip route 47.79.148.15 255.255.255.255 Null0
+ip route 47.79.148.91 255.255.255.255 Null0
 ip route 47.82.7.206 255.255.255.255 Null0
 ip route 47.83.141.98 255.255.255.255 Null0
 ip route 47.83.167.20 255.255.255.255 Null0
@@ -553,6 +559,7 @@
 ip route 60.250.173.233 255.255.255.255 Null0
 ip route 60.251.67.157 255.255.255.255 Null0
 ip route 61.0.41.133 255.255.255.255 Null0
+ip route 61.1.236.142 255.255.255.255 Null0
 ip route 61.3.109.224 255.255.255.255 Null0
 ip route 61.65.40.244 255.255.255.255 Null0
 ip route 61.93.218.229 255.255.255.255 Null0
@@ -702,6 +709,7 @@
 ip route 95.214.55.45 255.255.255.255 Null0
 ip route 95.226.22.1 255.255.255.255 Null0
 ip route 96.84.205.30 255.255.255.255 Null0
+ip route 97.139.1.76 255.255.255.255 Null0
 ip route 99.83.161.153 255.255.255.255 Null0
 ip route 101.36.121.4 255.255.255.255 Null0
 ip route 101.108.12.251 255.255.255.255 Null0
@@ -1467,6 +1475,7 @@
 ip route 139.59.143.102 255.255.255.255 Null0
 ip route 139.84.164.5 255.255.255.255 Null0
 ip route 139.135.43.153 255.255.255.255 Null0
+ip route 139.135.45.199 255.255.255.255 Null0
 ip route 139.193.130.7 255.255.255.255 Null0
 ip route 139.216.137.182 255.255.255.255 Null0
 ip route 140.150.36.59 255.255.255.255 Null0
@@ -2321,6 +2330,7 @@
 ip route 180.214.239.142 255.255.255.255 Null0
 ip route 180.252.196.6 255.255.255.255 Null0
 ip route 181.16.136.5 255.255.255.255 Null0
+ip route 181.79.85.69 255.255.255.255 Null0
 ip route 181.112.228.11 255.255.255.255 Null0
 ip route 181.115.166.151 255.255.255.255 Null0
 ip route 181.115.166.166 255.255.255.255 Null0
@@ -2391,6 +2401,7 @@
 ip route 185.91.127.104 255.255.255.255 Null0
 ip route 185.91.127.235 255.255.255.255 Null0
 ip route 185.93.69.163 255.255.255.255 Null0
+ip route 185.93.89.97 255.255.255.255 Null0
 ip route 185.93.89.118 255.255.255.255 Null0
 ip route 185.94.111.1 255.255.255.255 Null0
 ip route 185.107.44.224 255.255.255.255 Null0
@@ -2576,6 +2587,7 @@
 ip route 194.87.227.93 255.255.255.255 Null0
 ip route 194.126.202.234 255.255.255.255 Null0
 ip route 194.163.152.123 255.255.255.255 Null0
+ip route 194.163.168.199 255.255.255.255 Null0
 ip route 194.164.169.45 255.255.255.255 Null0
 ip route 194.233.78.209 255.255.255.255 Null0
 ip route 194.233.82.163 255.255.255.255 Null0

--- 2025-09-21/AIR9700-1-CRI-WF
+++ 2025-09-22/AIR9700-1-CRI-WF
@@ -443,7 +443,7 @@
  statistics enable
  pm-server pmftp17230045
   protocol sftp ip-address 172.30.0.45 port 31922
-  username ux9toV1d@4IgF8wbarv2sVy8yh2NQaa password %^%#RP>C&XR~cA3eW5@<-)ZCG|<bQ@cY0R^H.uYcvBB+%^%#
+  username Ld33dnSl@4IgF8wbarv2sVy8yh2NQaa password %^%#49kV%66O[2>Vu6.vzUr;.sj79EK$%,iqCO+3^p(4%^%#
   path /pmftp
  upload-config 1002dac1e6402asso254smbkbb8m6_3 server pmftp17230045
  upload-config 1002dac1e6402phys254smbkbb8m6_3 server pmftp17230045
`