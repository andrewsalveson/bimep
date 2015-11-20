FROM	centos:centos6
# enable extra packages for linux on CentOS
RUN	yum install -y epel-release
# install node.js and npm
RUN	yum install -y nodejs npm
# install app dependencies
COPY	package.json /src/package.json
RUN	cd /src; npm install
# bundle app source
COPY	. /src

EXPOSE 8080
CMD ["node", "/src/index.js"]
