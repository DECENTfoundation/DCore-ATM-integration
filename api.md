POST /buy
```
http -b POST :9696/buy username=admin password=admin amount=0.1337 address=public-account-2
```

### GET /accounts

### GET /balance

### GET /balance/public-account-1

### import on publictestnet
```
http -b :9696/de/initialSetup/public-account-1,5KfatbpE1zVdnHgFydT7Cg9hJmUVLN7vQXJkBbzGrNSND3uFmAa
```

### import on mainnet
```
http -b :9696/de/initialSetup/account_name_on_decentnetwork,privateKey
```

### what's imported
```
http -b :9696/d/listMyAccounts
```

```
http -b POST :9696/buy username=admin password=admin amount=0.1337 address=u902ba6b7a222a7a1a272d35d93d8f82f
```
