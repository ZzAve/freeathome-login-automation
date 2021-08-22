#!make
include .env
export $(shell sed 's/=.*//' .env)


docker-tag=zzave/freeathome-login-automate:latest
docker-name=freeathome-login-automate

build:
	docker build -t ${docker-tag} .
.PHONY: build

run-local:
	npm start
run:
	docker run --rm -i \
			--name ${docker-name} \
			-e HOST \
			-e USERNAME \
			-e PASSWORD \
			-v ${PWD}/screenshots:/usr/src/app/screenshots \
			${docker-tag}
.PHONY: run

stop:
	docker stop ${docker-name}
.PHONY: stop

destroy:
	docker rmi ${docker-tag}
.PHONY: destroy

logs:
	docker logs -f ${docker-name}
.PHONY: log
