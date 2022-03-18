import bcrypt from 'bcrypt';
import connection from '../database.js';

async function createUser(req, res) {
  const user = req.body;

  try {
    const existingUsers = await connection.query('SELECT * FROM users WHERE email=$1', [user.email])
    if (existingUsers.rowCount > 0) {
      return res.sendStatus(409);
    }

    const passwordHash = bcrypt.hashSync(user.password, 10);

    await connection.query(`
      INSERT INTO 
        users(name, email, password) 
      VALUES ($1, $2, $3)
    `, [user.name, user.email, passwordHash])

    res.sendStatus(201);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

async function getUser(req, res) {
  const { user } = res.locals;

  try {
    res.send(user);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

async function listShortUrlUser(req, res){
  const {id} = req.params

  try {
    const user = await connection.query(`
    SELECT
      u.id, u.name, SUM(s."visitCount") AS "visitCount"
      FROM users u
      JOIN "shortenedUrls" s
        ON s."userId" = u.id
      WHERE u.id=$1
      GROUP BY u.id
    `, [id])
    const shortenedUrls = await connection.query(`
      SELECT
        id, "shortUrl", url, "visitCount"
        FROM "shortenedUrls"
        WHERE "userId" = $1
    `, [id])

    res.status(200).send({...user.rows[0], shortenedUrls: shortenedUrls.rows})
  } catch (error) {
    console.log(error);
    res.sendStatus(500)
  }
}

async function listRanking(req, res) {
  console.log("oi");
  try {
    const result = await connection.query(`
      SELECT
        u.id, u.name, COUNT(s.id) AS "linkCount", SUM(s."visitCount") AS "visitCount"
        FROM users u
        LEFT JOIN "shortenedUrls" s
          ON s."userId" = u.id
        GROUP BY u.id
        ORDER BY "visitCount" DESC
        LIMIT 10
    `);
    console.log(result);

    res.status(200).send(result?.rows)
  } catch (error) {
    console.log(error);
    res.sendStatus(500)
  }
}

export {
  createUser,
  getUser,
  listShortUrlUser,
  listRanking
}