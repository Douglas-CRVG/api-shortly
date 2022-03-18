import connection from "../database.js";

async function createUrl(req, res){
    const {url} = req.body;
    try {
        const shortURL = parseInt(Date.now()%(10**8)).toString(16);

        await connection.query(`
            INSERT
                INTO "shortenedUrls" (url, "shortUrl", "userId")
                VALUES ($1, $2, $3)
        `, [url, shortURL, res.locals.user.id])

        res.status(201).send({shortURL})
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}

async function listShortUrl(req, res) {
    try {
        const result = await connection.query(`
            SELECT
                *
                FROM "shortenedUrls"
                WHERE "shortUrl"=$1
        `, [req.params.shortUrl])

        if(result.rowCount === 0){
            return res.sendStatus(404)
        }

        const {
            id,
            url,
            shortUrl
        } = result.rows[0]
        res.status(200).send({id, url, shortUrl})
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}

async function deleteShortUrl(req, res){
    const {user} = res.locals
    const {shortId} = req.params
    try {
        const shortUrl = await connection.query(`
            SELECT
                *
                FROM "shortenedUrls"
                WHERE id = $1
        `, [shortId])

        if(shortUrl.rows[0]?.userId !== user.id){
            return res.sendStatus(401)
        }

        await connection.query(`
            DELETE
                FROM "shortenedUrls"
                WHERE id = $1
        `, [shortId])

        res.sendStatus(204)
    } catch (error) {
        console.error(error);
        res.sendStatus(500)
    }
}

export {
    createUrl,
    listShortUrl,
    deleteShortUrl
}