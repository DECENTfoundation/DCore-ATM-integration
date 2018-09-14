# DCore integration with General Bytes ATM

This repository contains:
1. DCore wallet wraper to serve as hot wallet
2. Extension library
2. Setup tutorial for hot wallet, Bittrex exchange and extension library

## **Dcore unix wallet setup**

1.Clone repository to your custom destination on ATM server

        git clone https://github.com/DECENTfoundation/DCore-ATM-integration

2.Check the version of docker

        docker version

If you dont have docker

        sudo apt-get install docker-ce

Or look further here

[https://docs.docker.com/install/linux/docker-ce/ubuntu/#install-docker-ce-1](https://docs.docker.com/install/linux/docker-ce/ubuntu/#install-docker-ce-1)



        wget -qO- https://get.docker.com/ | sh

3.Replace USERNAME with your username on the machine
(if you don't know your username, use 'whoami' command)

        sudo usermod -aG docker USERNAME

4.Logout from server and login again

5.Enter custom DCore wallet folder and execute commands one at the time

        cd decent\_atm

        sudo su

        sudo curl -L https://github.com/docker/compose/releases/download/1.21.2/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose

        chmod +x /usr/local/bin/docker-compose

        docker-compose -f production.yml up -d

        docker ps

6.Now you should see 3 decent docker images running

decent\_atm\_atm\_1

dcore-atm-cliwallet

dcore-atm-mainnet


7.Import your private key/account into the wallet

_You do this by making a HTTP call to localhost:9696 and providing your account name and private key_
_You can install httpie for making http calls from command line_

[https://httpie.org/doc#installation](https://httpie.org/doc#installation)

replace ACCONT_NAME_ON_DECENTNETWORK and PRIVATE_KEY with your credentials

        http -b :9696/de/initialSetup/ACCONT_NAME_ON_DECENTNETWORK,PRIVATE_KEY

Thats all, with this step your Dcore wallet is up and running. Make sure your imported account has enough balance on it. If it doesn't, you need to send some DCT to it.

The API for wallet is here

[https://gitlab.com/yangwao/decent\_atm/blob/master/api.md](https://gitlab.com/yangwao/decent_atm/blob/master/api.md)

You can check if account was properly imported by

        http -b :9696/d/listMyAccounts

Check the balance on imported accounts

        http -b :9696/balance

**Complete wallet API is here**

[https://gitlab.com/yangwao/decent\_atm/blob/master/api.md](https://gitlab.com/yangwao/decent_atm/blob/master/api.md)



## **Library installation on server**

File: batm\server\extensions\extra-assembly-0.1.0-SNAPSHOT.jar

1.Upload file on server

You can use cyberduck on MAC to upload conveniently

2.switch to root

       sudo su

3.Enter General Bytes server folder:

        cd /batm/app/master/extensions

4.copy JAR extension into this folder

        cp /path_where_you_downloaded_jar .

        cd ../../..

5.restart the server

        ./batm-manage stop all

        ./batm-manage start all

This part is done, now go into admin setup

## **Admin setup**

### **Wallet setup**

1.Go to _Crypto settings_

2._Add_

At this stage you should see DCT in the menu Crypto Currency

Set parameters EXACTLY like on this screenshot

![Image1](/images/image1.png)

3.In the Hot Wallet Buy - parameters field put

        http:admin:admin:localhost:9696

![Image2](/images/image2.png)

4.Click SUBMIT

5.Go to _Terminals_ and pick your terminal where you want to add DCT coin

6.In terminal settings in Currencies part add DCT crypto currency

7.In Crypto Settings part set DCT settings as you name them

![Image3](/images/image3.png)

8.Click MODIFY

Now you are all ready to go. You might need to restart physical machine in order to have new settings to show up



### **Bittrex exchange integration**

1.Go to Bittrex exchange and click Settings.

2.Click on API Keys to view key settings.

![Image4](/images/image4.png)

3.Add new key, and allow all settings like you see in this screenshot

![Image5](/images/image5.png)

4.Click Save, put your Authenticator key - two factor authentication (if you don't have it activated, you will need to do that in Two-Factor Authentication in the same Settings screen)

Now you will be able to see **Key** and **Secret,** like this

![Image6](/images/image6.png)

Write down the **Key** and the **Secret** in the safe place, because this is the only time you are able to copy a key secret. If you lose it, you will later need to re-create new key to see new secret.

5.Now go to General Bytes admin.

Add new Crypto setting, where you setup new DCT buy configuration with Bittrex exchange.

You should see option of Bittrex exchange visible

![Image7](/images/image7.png)

Put parameters in the format

Apikey:secret

E.g.

9c1b049844d84849f7a606311953b758:1607470db849f0sdb56eb58df156f672

6.Choose appropriate strategy, and you are good to go.

IMPORTANT:

TODO EXPLAIN BTC ? DCT ? USD Storage of coins and how it works.

# **NOTES**

1. If you upgraded General Bytes server or terminal, you need to copy library into extension folder again, Your ATM will not work due to connection errors. You can see this setup in library installation guide


