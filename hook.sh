# First, get the zip file
cd .. && wget -O join-master.zip -q https://github.com/trieukhang274/join/archive/master.zip

#second, unzip it, if the zip file exists
if [ -f join-master.zip ]; then
    # Unzip the zip file
    unzip -q join-master.zip

    # Delete zip file
    #rm ../projectmaster.zip

    # Rename project directory to desired name
    mv join-master join-news

    # Delete current directory
    rm -rf join

    # Replace with new files
    mv join-news join

    # install the bcrypt-nodejs for node js
    cd join && npm install bcrypt-nodejs    

    #remove the old one
    cd node_modules && rm -rf bcrypt

    # rename
    mv bcrypt-nodejs bcrypt

    cd ..

    #stop all hook.js
    forever stopall

    #restart
    forever start hook.js


    #back and start server again
    node app.js

    # Perhaps call any other scripts you need to rebuild assets here
    # or set owner/permissions
    # or confirm that the old site was replaced correctly
fi