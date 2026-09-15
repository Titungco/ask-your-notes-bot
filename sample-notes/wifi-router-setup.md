# Home Wi-Fi Router Setup

The router in the living room is a TP-Link Archer AX55, running firmware version 1.2.3. It handles both the 2.4GHz and 5GHz bands, broadcasting them under the same SSID with band steering enabled so devices pick the best one automatically.

The admin panel lives at 192.168.1.1. Login uses a dedicated admin account, not the Wi-Fi password — the credentials are stored in the household password manager under "Home Router Admin". Change the admin password if it's ever reset to factory defaults after a firmware update.

Guest network is enabled and isolated from the main LAN, so guest devices can't see the NAS or the printer. The guest password is changed every few months and written on the small whiteboard by the router.

Port forwarding is configured for the home security camera system: external port 8443 forwards to the camera NVR at 192.168.1.50 on port 443. If the NVR's local IP ever changes (it should be static via DHCP reservation), the port forwarding rule needs to be updated too.

DNS is set to use a local Pi-hole instance at 192.168.1.10 for ad blocking, with Cloudflare's 1.1.1.1 as the fallback if the Pi-hole is down for maintenance.
