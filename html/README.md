# HTML i.e. CURL|BASH
### Usage:
```
bash <(curl -s [yourdomain.com]/[script])
```

<br>

## wp-to-zone.(ssh|ftp)
### Info:
* Meant only for Zone SN servers to migrate external (or local) WordPress websites to Zone via SSH or FTP.
* Depending on the option selected, the specification on how the migration is done for...
  - <b>SSH</b>: File transfer is done using "rsync". Database dump is done with the external server's DB credentials, that are received from the WordPress "wp-config.php" file using "sed".
  - <b>FTP</b>: A PHP file, that makes an archive of the files, is sent over to the external server and activated via "curl". After that, the file is transferred to the Zone server and they get extracted with the corresponding unzip package depending on the file extension (.tar|.tar.gz|.zip) 
### How to:
* Gather the follwing data from the external server:
  - SSH/FTP host (domain/IP)
  - SSH/FTP user
  - SSH/FTP password (optional, if using an SSH key)
  - SSH/FTP port
* From Zone server run the following.
  - For SSH:
    ```
    bash <(curl -s [yourdomain.com]/wp-to-zone.ssh)
    ```
  - For FTP:
    ```
    bash <(curl -s [yourdomain.com]/wp-to-zone.ftp)
    ```
* Depending on what's missing, add the required parameters to the same command. An example for the SSH script:
  ```
  bash <(curl -s mydomain.com/wp-to-zone.ssh) -u sshuser -h external.com -a pass -p Passw0rd -r /var/www/html
  ```
* Check if any optional parameters should also be set. (for example, if the database in Zone has already been created, then add the info with the -X -Y and -Z params.)
* If no optional params should be set, then press "Enter" or type "y" to continue.
* If database creadentials are pre-set, then you can skip this step. If not, then a new database must be created in my.zone.eu self service with the given data.
* After that, the migration options are shown. Select the desired option by entering the option number.

After that, the migration will begin and will show you if any errors/warnings come up. If none, then all done and the migration has finished.

<br>

## inodes|space|disk
* inodes && space - Meant for Zone servers since it gets the inode and disk space limit info from the built in "quota" command, but can also be used on all other machines. It will just skip the quota limit part.
* disk - Requires sudo for the "fdisk" command. So also not meant for Zone servers.
### Description
(Assuming the "quota" command exists)
* inodes: Displays...
  - used inodes and the limit.
  - current directory's top 10 folders for most used inodes.
  - all of the domains directory's top 10 folders for most used inodes separately.
  - "./domeenid" directory's top 10 folders for most used inodes.
* space: Displays the same as for inodes, but the sizes of the folders.
* disk : Displays...
  - "df -h" bringing out the / directory's used space.
  - "fdisk -l" bringing out the current partition's size and name it's under.
### Usage
* inodes:
  ```
  bash <(curl -s [yourdomain.com]/inodes)
  ```
- disk:
  ```
  bash <(curl -s [yourdomain.com]/disk)
  ```
- space:
  ```
  bash <(curl -s [yourdomain.com]/space)
  ```

<br>

## aliases
Meant for personal use, but can be used by updating ~/.bashrc with the following imput:
```
source <(curl -s [yourdomain.com]/aliases)
```

<br>


