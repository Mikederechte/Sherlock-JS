import readline from 'readline'
import fetch from 'node-fetch'
import chalk from 'chalk'
import { readFileSync, writeFileSync } from 'fs'
import cheerio from 'cheerio'

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const urllist = JSON.parse(readFileSync('./urls.json', 'utf8'))


rl.question('Gimme that username: ', async (username) => {
    console.clear()
    console.log(chalk.yellowBright(`Suche nach ${username} auf:\n`))
    let htmlContent;
    const working = [];
    for(const service in urllist){
        try {

            const response = await fetch(urllist[service].replace('{user}', `${username}`));
            htmlContent = await response.text();
            

            const $ = cheerio.load(htmlContent);
            const title = $('title').text()

            // if(service == 'Fiverr'){
            //     writeFileSync('./fiverrgut.html', htmlContent, 'utf8')
            // } 
            
            if (response.status == 404 || title.toLowerCase() == 'instagram' || title.toLowerCase() == 'facebook') {
                console.log(`${chalk.cyanBright("[")}${chalk.magentaBright('*')}${chalk.cyanBright(']')}`, `${service}:`, chalk.redBright('Kein User gefunden'));
            } else if(response.status == 200){
                console.log(`${chalk.cyanBright("[")}${chalk.magentaBright('*')}${chalk.cyanBright(']')}`, `${service}:`, chalk.greenBright(`${urllist[service].replace('{user}', `${username}`)}`));
                working.push(`${service}: ${urllist[service].replace('{user}', `${username}`)}`)
            } else {
                console.log(`${chalk.cyanBright("[")}${chalk.magentaBright('*')}${chalk.cyanBright(']')}`, `${service}:`, chalk.yellowBright(`Ein unbekannter Fehler ist aufgetreten, joa pech halt: ${urllist[service].replace('{user}', `${username}`)}`))
            }
        } catch (error) {
            console.error('Fehler bei der Überprüfung der Verfügbarkeit:', error);
        } finally {
            rl.close();
        }

        writeFileSync(`./saveduser/${username}.txt`, working.join('\n\n'), 'utf8')
    }
});