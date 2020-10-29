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
    
	
	"sql"      :{
		"host"          : "localhost",
		"username"      : "username",
		"password"      : "password",
		"database"      : "database",
		"charset"       : "utf8"
	}
}
```

## Database - PostgreSQL
```sql
CREATE TABLE members
(
    id decimal NOT NULL,
    name VARCHAR NOT NULL,
    invoice boolean NOT NULL,
    membershipid decimal,
    membershiptype decimal,
    PRIMARY KEY (id)
)

CREATE TABLE log
(
    id SERIAL NOT NULL,
	member_id decimal NOT NULL,
    datetime timestamp without time zone NOT NULL,
    state boolean NOT NULL,
    PRIMARY KEY (id)
)

CREATE FUNCTION public.on_invoice_update()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF
AS $BODY$
BEGIN
	IF NEW.inVoice <> OLD.inVoice THEN
		 INSERT INTO log (member_id, datetime, state) VALUES (NEW.id, NOW(), NEW.inVoice);
	END IF;

	RETURN NEW;
END;
$BODY$;

CREATE TRIGGER trigger_on_invoice_update
    AFTER UPDATE 
    ON public.members
    FOR EACH ROW
    EXECUTE PROCEDURE public.on_invoice_update();
```
