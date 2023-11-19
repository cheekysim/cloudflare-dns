# Cloudflare DNS
This is a simple program to keep your cloudflare ip up to date with your public ip
Since cloudflare does not support dynamic ips, this is a workaround

This is meant to be used with portainer and deployed as a repository stack
https://www.portainer.io/

# Config
The program is easy to configure, it just uses a few environment variables
These can easily be added when running the stack

## Environment Variables
```env
ZONE=Id of the zone to use
RECORDS=IDs of the record separated with a comma
TOKEN=API Token
```
## Get API Token
https://dash.cloudflare.com/profile/api-tokens
1. Create Token
2. Use Edit Zone DNS Template
3. Configure Zone Resources For The Zone To Use
4. Continue To Summary
5. Create Token

## Get Zone and Record
Zone can be found in the API Section of the Domains' Overview Page

Program will show you all Records if one isn't provided. Set RECORDS env to the correct ID.