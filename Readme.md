Psychic Octophant.js
====================

Requirements
------------
You need to install the following components in order to run the server locally:
 * C++ Compiler (included in `Visual Studio` on Windows, in GNU on Linux?)
 * Python

Also keep in mind to set the environment variables correctly if not done by the installation.

In order to work with the database, you also need to install a mongodb locally. Just use the default ports and set no auth and things will be nice.

Installation
------------
Simply open your command line, navigate to you directory (using `cd` command) and type the following command:
```npm install```

In order to install the database, run the following command once:
```node setup.js```
This will install some "demo content" (which is actually our real data) to get started fast.

Troubleshoot
------------
If errors occur during installation and you are windows, check the version of `Visual Studio` and try to run npm install again with the following arguments:
```npm install --msvs_version=2013```

If you are using `Visual Studio 2012` instead, change the argument:
```npm install --msvs_version=2012```