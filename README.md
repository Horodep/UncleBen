# UncleBen
discord bot logging voice presence

## example config.json
```json
{
   "_comment": "This is an example file. Here should be your data.",
   
	"discordApiKey" : "000000000000000000000000000000000000000000000000000",
	"BotName"       : "Uncle Ben",

	"d2apiKey"      : "00000000000000000000000000000000",
	"d2clientId"    : "00000",

	"guild"		      : "000000000000000000",
	"channels":{
		"sandbox"     : "000000000000000000",
		"afk"         : "000000000000000000"
	},
        "users":{
                "developer"   : "000000000000000000"
        },
    
	
	"mysql"      :{
		"host"          : "localhost",
		"username"      : "username",
		"password"      : "password",
		"database"      : "database",
		"charset"       : "utf8"
	}
}
```

## Database
```sql
CREATE TABLE members (
    id VARCHAR(255) NOT NULL, /*I had some troubles with requesting bigint so it is string*/
    name BINARY(50) NOT NULL,
    inVoice BINARY NOT NULL,
    membershipId VARCHAR(255) DEFAULT NULL,
    membershipType INT UNSIGNED DEFAULT NULL,
    PRIMARY KEY (id)
)

CREATE TABLE log (
    id INT NOT NULL AUTO_INCREMENT,
    member_id BIGINT NOT NULL,
    datetime DATETIME NOT NULL,
    state BINARY NOT NULL,
    PRIMARY KEY (id),
    UNIQUE INDEX id_UNIQUE(id)
)

CREATE 
	DEFINER = 'root'@'localhost'
TRIGGER onInVoiceUpdate
	AFTER UPDATE
	ON members
	FOR EACH ROW
BEGIN
    IF NEW.inVoice <> OLD.inVoice THEN
        INSERT INTO auroras.log (member_id, datetime, state) VALUES (NEW.id, NOW(), NEW.inVoice);
    END IF;
END
```
