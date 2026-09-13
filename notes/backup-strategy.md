# Personal Backup Strategy

Backups follow a 3-2-1 approach: three copies of important data, on two different types of media, with one copy off-site.

The primary copy lives on the desktop's internal SSD. Every night at 2am, a script mirrors the Documents, Photos, and Projects folders to a Synology NAS on the local network using rsync over SSH. The NAS runs its own RAID1 mirroring across two drives, so a single drive failure doesn't lose data.

The off-site copy is handled by Backblaze, which continuously backs up the NAS's contents to the cloud. Backblaze retains deleted files for 30 days, which has been enough to recover from a couple of accidental deletions in the past.

Restore drills are done twice a year: pick a handful of random files, restore them from the NAS and separately from Backblaze, and confirm they open correctly and match checksums. The last drill was done in March and both restore paths worked without issues.

Laptops are not included in the nightly rsync job — they instead sync their Documents folder to the NAS whenever they're on the home Wi-Fi network, using a scheduled task that runs every time the laptop wakes from sleep.
