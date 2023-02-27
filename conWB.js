const { Pool, Client } = require("pg");

//LIBRERIA VENOM
// Supports ES6
// import { create, Whatsapp } from 'venom-bot';
const venom = require("venom-bot");

//CONSUMIR API
const axios = require("axios");


//WEB SCRAPING
const puppeteer = require('puppeteer');
const randomUseragent = require('random-useragent');
const { setTimeout } = require("timers");


venom
  .create({
    session: 'session-name', //name of session
    multidevice: true // for version not multidevice use false.(default: true)
  })
  .then((client) => start(client))
  .catch((erro) => {
    console.log(erro);
  });


function azar(date) {
  return date[Math.floor(Math.random() * date.length)];
}


//funcion principal ____________________________________
function start(client) {
  // client.setProfilePic('./images/logoTesis.png');
  // // Set client status
  // client.setProfileStatus('✈️Chatbot para peticiones hacia la Jefatura de Sotware!😎🤩✈️');


  const cliente = new Client({
    user: "postgres",
    host: "localhost",
    database: "banderasbot",
    password: "postgres",
    port: 5432,
  });
  cliente.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
  });

  client.onMessage(async (message) => {
    // await client.setProfilePic('./images/logoTesis.png');
    // // Set client status
    // await client.setProfileStatus('✈️Chatbot para peticiones hacia la Jefatura de Sotware!😎🤩✈️ ');

    // Set client profile name
    // await client.setProfileName('🤖 ADEL 🤖');

    var nameUser = message.notifyName;
    // var nameUser = message.chat.contact.pushname;
    var msjwp = '';
    var number = message.from;

    let idbtn = message.chatId

    if (message.type == "chat" || message.isForwarded) {
      msjwp = message.body;
    }
    else if (message.type == "ptt") {
      //TODO: Consumir el web service
      // console.log(message);
      //TODO: Consumir el web service
      const fs = require('fs')
      const mime = require('mime-types')

      const buffer = await client.decryptFile(message);
      let fileName1 = `${Date.now()}.${mime.extension(message.mimetype)}`
      const pathFiles = `/home/jeisson/Escritorio/files/${fileName1}`;
      await fs.writeFile(pathFiles, buffer, (err) => {
        if (err) {
          console.error(`Error al descargar el archivo`);
        } else {
          console.log('Descarga completa');
        }
      });
      let fileSinExtension = fileName1.split('.')[0]
      console.log(fileSinExtension + 'sin extension ===============');

      let response2 = await axios.post("http://127.0.0.1:5002/predecir/" + fileSinExtension);
      let = { data } = response2;
      msjwp = data.auidio
    }

    // console.log(message, 'este es el mensjae 🤪🤪🤪🤪🤪🤪🤪🤪🤪🤪🤪');
    if (msjwp != '') {

      let response = await axios.post("http://127.0.0.1:5000/predecir/" + msjwp);
      let = { data } = response;

      let data_insultos = data.insultos;
      insultos_numero = data_insultos[0]
      insultos_palabra = data_insultos[1]
      let data_maxcore = data.maxscore;
      let data_tag = data.tag;
      let data_nocontesta = data.nocontesta;
      let data_resp = data.respuestasj;

      // impresiones de as variables anteriores
      // console.log(data_insultos);
      // console.log(data.respuestasj);
      // console.log(data_maxcore);

      /**
       * GUARDAR EN LA DB TODOS LOS MENSAJES
       */
      await cliente.query("INSERT INTO public.mensajes(id, usuario, telefono, fecha_msj, msj_enviado, plataforma, msj_recibido) VALUES (default, '" + nameUser + "', '" + number + "', current_timestamp, '" + msjwp + "', 'WhatsApp', ' ');")

      /**ID DE LA DB MENSAJES */
      const idMensajes = await cliente.query("select * from mensajes where telefono='" + number + "' ORDER BY id DESC")
      todoMensaje = idMensajes.rows;
      let mapQueryIdMensajes = todoMensaje.map((test2) => test2.id);
      const idDataMensaje = mapQueryIdMensajes[0] //en esta variable esta el id quye tiene el registro en la db MENSAJES

      let mapQueryMensajes = todoMensaje.map((test2) => test2.msj_enviado);
      const DataMensajeEnviado = mapQueryMensajes[0]

      console.log(idDataMensaje + " es el ide de la base de datos MENSAJE");
      console.log(DataMensajeEnviado + " ultimo msj de " + nameUser);


      /**
       * METODOS (FUNCIONES)
      */

      /**ENCUESTA NPS */
      const npsEncuesta = async () => {
        setTimeout(() => {
          client
            .sendText(message.from, `${nameUser}  ¿Cómo te ha parecido mi trabajo? ¡Me encantaría leer tu opinión!🤔 Por favor, toma unos minutos para completar esta encuesta 📝, ¡se agradece mucho! 🙏`)
        }, 2000);
        setTimeout(() => {
          client
            .sendImage(
              number,
              './images/nps.jpeg',
              'NPS',
              `¿Qué tan probable es que me recomiendes con tus conocidos? 🤔\nEscribe un número entre 0 y 10 siendo:\n*10: Es muy probable. 🤩* \n *0: Muy poco probable.  🚫*`
            )
            .then((result) => {
              console.log('Result: ', result); //return object success
            })
            .catch((erro) => {
              console.error('Error when sending: ', erro); //return object error
            });
        }, 4000);
      }

      /**FIN ENCUESTA NPS */

      //SCRAPING RUAH
      const webScrapingRuah = async (msjruah, idData) => {

        try {
          client
            .reply(message.from, `Por favor *${nameUser}* espera un momento. 🤝🤖`, message.id)
            .then((result) => {
              chat.lastReceivedKey._serialized
              console.log('Result: ', result); //return object success
            }).catch((erro) => {
              console.error('Error when sending: ', erro); //return object error
            });
          await cliente.query("update estadosmessages set estado='espera' where id='" + idData + "'")
          const header = randomUseragent.getRandom((ua) => {
            return ua.browserName === 'Chrome'
          });
          const browser = await puppeteer.launch({
            headless: true,
            ignoreHTTPSErrors: true,
          });
          console.log(msjruah + "es el msj ruahhhhhhhhhhhhhhhhhhhhhhhhhhh");
          const page = await browser.newPage();


          await page.setUserAgent(header);

          await page.setViewport({ width: 1366, height: 768 });

          await page.setDefaultNavigationTimeout(60000);
          try {
            await page.goto(`https://ruah.unicesmag.edu.co/recuperarclave`);

            const recuperarClave = await page.waitForSelector('#email');

            await recuperarClave.type(msjruah);
            await page.click('.btn-raised')

            let msjinforuah = await page.waitForSelector('#swal2-content')

            const mensajePlataformaRuah = await page.evaluate(msjinforuah => msjinforuah.innerText, msjinforuah);
            await cliente.query("update mensajes set msj_recibido='" + mensajePlataformaRuah + "' where id='" + idDataMensaje + "'")
            await browser.close()
            if (mensajePlataformaRuah.includes('enviado') && mensajePlataformaRuah.includes('contraseña')) {
              client
                .reply(message.from, mensajePlataformaRuah, message.id)
                .then((result) => {
                  chat.lastReceivedKey._serialized
                  console.log('Result: ', result); //return object success
                }).catch((erro) => {
                  console.error('Error when sending: ', erro); //return object error
                });
              await cliente.query("update estadosmessages set estado='encuesta' where id='" + idData + "'")
              client.sendText(message.from, '💥💥 *NOTA:* 💥💥  📣📢Ten en cuenta que si utilizas Zeus la contraseña cambio por la que ha sido enviada al correo electronico.')
              npsEncuesta()
            } else {
              client
                .sendText(message.from, `😕 ¡Vaya! La dirección de correo electrónico no se pudo encontrar. ¡No te preocupes! Aquí tienes dos opciones para solucionarlo:\n\n*1.* 🔁 Volver a escribir el correo\n*2.* 🤔 Hacer otra pregunta\n\n¡Elige la opción que prefieras escribiendo *1* o *2* 🤗`)
              await cliente.query("update estadosmessages set estado='opcion' where id='" + idData + "'")
            }
          } catch (error) {
            await browser.close()
            errorCaragRuah = `Disculpame *${nameUser}* 🥹 lo que sucede es que hay muchas peticiones hacia la plataforma en este momento. Por favor vuelve a escribir tu correo`
            client
              .reply(message.from, errorCaragRuah, message.id.toString())
              .then((result) => {
                chat.lastReceivedKey._serialized
                console.log('Result: ', result); //return object success
              }).catch((erro) => {
                console.error('Error when sending: ', erro); //return object error
              });
            await cliente.query("update estadosmessages set estado='ruah' where id='" + idData + "'")
            await cliente.query("update mensajes set msj_recibido='" + errorCaragRuah + "' where id='" + idDataMensaje + "'")
          }
        } catch (error) {
          console.log(error);
        }
      }
      //FIN SCRAPING RUAH

      //SCRAPING TAU
      const webScrapingTau = async (msjtau, idData) => {
        client
          .sendText(message.from, `Por favor *${nameUser}* espera un momento.🤝🤖`);
        await cliente.query("update estadosmessages set estado='espera' where id='" + idData + "'")
        const header = randomUseragent.getRandom((ua) => {
          return ua.browserName === 'Chrome'
        });
        const browser = await puppeteer.launch({
          headless: true,
          ignoreHTTPSErrors: true,
        });
        const page = await browser.newPage();
        await page.setUserAgent(header);
        await page.setDefaultNavigationTimeout(0);
        await page.setViewport({ width: 1366, height: 768 });

        await page.goto(`https://uv4.unicesmag.edu.co/login/forgot_password.php`);
        const recuperarClave = await page.waitForSelector('#id_username');

        await recuperarClave.type(msjtau);

        await cliente.query("update estadosmessages set estado='encuesta' where id='" + idData + "'")
        //demorar 3 sg
        await page.click('#id_submitbuttonusername')


        let msjinfotau = await page.waitForSelector('#notice')

        // const name = await content.$("div.appname");
        const mensajePlataformaTau = await page.evaluate(msjinforuah => msjinforuah.innerText, msjinfotau);
        await cliente.query("update mensajes set msj_recibido='" + mensajePlataformaTau + "' where id='" + idDataMensaje + "'")
        await client
          .sendText(message.from, mensajePlataformaTau, message.id)
        await browser.close()
        npsEncuesta()

      }
      //FIN SCRAPING tau

      //SCRAPING ZEUS
      const webScrapingZeus = async (msjzeus, idData) => {

        try {
          client
            .reply(message.from, `Por favor *${nameUser}* espera un momento. 🤝🤖`, message.id)
            .then((result) => {
              chat.lastReceivedKey._serialized
              console.log('Result: ', result); //return object success
            }).catch((erro) => {
              console.error('Error when sending: ', erro); //return object error
            });
          await cliente.query("update estadosmessages set estado='espera' where id='" + idData + "'")
          const header = randomUseragent.getRandom((ua) => {
            return ua.browserName === 'Chrome'
          });
          const browser = await puppeteer.launch({
            headless: true,
            ignoreHTTPSErrors: true,
          });
          console.log(msjzeus + "es el msj ZEUSSSSSSS");
          const page = await browser.newPage();


          await page.setUserAgent(header);

          await page.setViewport({ width: 1366, height: 768 });

          await page.setDefaultNavigationTimeout(60000);
          try {
            await page.goto(`https://zeusacad.unicesmag.edu.co/`);
            const enlace = await page.$('a');
            // Hacemos clic en el enlace
            await enlace.click();
            await page.waitForTimeout(2000)

            const recuperarClave = await page.waitForSelector('#textfield-1040-inputEl');
            await recuperarClave.type(msjzeus);

            await page.click('#button-1041-btnInnerEl')

            await page.waitForTimeout(3000)
            const elementHandle = await page.$('#messagebox-1001-displayfield-inputEl');
            const mensajeZeus = await elementHandle.evaluate(element => element.textContent);
            // console.log(mensajeZeus);
            await browser.close()
            if (mensajeZeus.includes('enviado') && mensajeZeus.includes('contraseña')) {
              client
                .reply(message.from, mensajeZeus, message.id)
                .then((result) => {
                  chat.lastReceivedKey._serialized
                  console.log('Result: ', result); //return object success
                }).catch((erro) => {
                  console.error('Error when sending: ', erro); //return object error
                });
              await cliente.query("update estadosmessages set estado='encuesta' where id='" + idData + "'")
              client.sendText(message.from, '💥💥 *NOTA:* 💥💥  📣📢Ten en cuenta la contraseña  de Ruah cambio por la que ha sido enviada al correo electronico.')
              npsEncuesta()
            } else {
              client
                .sendText(message.from, `😕 ¡Vaya! La dirección de correo electrónico no se pudo encontrar. ¡No te preocupes! Aquí tienes dos opciones para solucionarlo:\n\n*1.* 🔁 Volver a escribir el correo\n*2.* 🤔 Hacer otra pregunta\n\n¡Elige la opción que prefieras escribiendo *1* o *2* 🤗`)
              await cliente.query("update estadosmessages set estado='opcionZeus' where id='" + idData + "'")
            }
          } catch (error) {
            await browser.close()
            errorCaragRuah = `Disculpame *${nameUser}* 🥹 lo que sucede es que hay muchas peticiones hacia la plataforma en este momento. Por favor vuelve a escribir tu correo`
            client
              .reply(message.from, errorCaragRuah, message.id.toString())
              .then((result) => {
                chat.lastReceivedKey._serialized
                console.log('Result: ', result); //return object success
              }).catch((erro) => {
                console.error('Error when sending: ', erro); //return object error
              });
            await cliente.query("update estadosmessages set estado='zeus' where id='" + idData + "'")
            await cliente.query("update mensajes set msj_recibido='" + errorCaragRuah + "' where id='" + idDataMensaje + "'")
          }
        } catch (error) {
          console.log(error);
        }
      }
      //FIN SCRAPING ZEUS

      /**VALIDACION PLATAFORMA */
      async function validacion_plataforma() {
        try {
          mrtauruah = msjwp.toUpperCase();
          if (
            mrtauruah.includes("RUAH") && message.isGroupMsg === false
          ) {

            const msjCambioCOntraseñaRuah = "🔐 Para el cambio de contraseña *Ruah*, por favor, introduce tu correo electrónico personal registrado en la universidad 📧. ¡Consigue una contraseña segura y única!"
            //CAMBIO EL ESTADO A RUAH
            const queryUpdateRuah = await cliente.query("update estadosmessages set estado='ruah' where telefono='" + number + "'")
            console.log(queryUpdateRuah.rows);
            console.log("se actualizooo!");



            client
              .sendText(message.from, msjCambioCOntraseñaRuah)
            await cliente.query("update mensajes set msj_recibido='" + msjCambioCOntraseñaRuah + "' where id='" + idDataMensaje + "'")
              .then((result) => {
                console.log("Result: ", result);
                cliente.query("update estadosmessages set estado='ruah' where telefono='" + number + "'")
              })
              .catch((erro) => {
                console.error("Error when sending: ", erro); //return object error
              });
          } else if (mrtauruah.includes("TAU") && message.isGroupMsg === false) {
            const msjCambioCOntraseñaTau = "🔐 Para el cambio de contraseña *Tau*, por favor, introduce tu documento de identidad 📧.  ¡Consigue una contraseña segura y única!"
            //CAMBIO EL ESTADO A TAU
            const queryUpdateTau = await cliente.query("update estadosmessages set estado='tau' where telefono='" + number + "'")
            console.log(queryUpdateTau.rows);
            console.log("se actualizooo!");
            client
              .sendText(message.from, msjCambioCOntraseñaTau)
            await cliente.query("update mensajes set msj_recibido='" + msjCambioCOntraseñaTau + "' where id='" + idDataMensaje + "'")
              .then((result) => {
                console.log("Result: ", result);
              })
              .catch((erro) => {
                console.error("Error when sending: ", erro); //return object error
              });
          } else if (mrtauruah.includes("ZEUS") && message.isGroupMsg === false) {
            const msjCambioCOntraseñaZeus = "🔐 Para el cambio de contraseña *Zeus*, por favor, introduce tu documento de identidad 📧.  ¡Consigue una contraseña segura y única!"
            //CAMBIO EL ESTADO A TAU
            const queryUpdateZeus = await cliente.query("update estadosmessages set estado='zeus' where telefono='" + number + "'")
            console.log(queryUpdateZeus.rows);
            console.log("se actualizooo! a zeus");
            client
              .sendText(message.from, msjCambioCOntraseñaZeus)
            await cliente.query("update mensajes set msj_recibido='" + msjCambioCOntraseñaZeus + "' where id='" + idDataMensaje + "'")
              .then((result) => {
                console.log("Result: ", result);
              })
              .catch((erro) => {
                console.error("Error when sending: ", erro); //return object error
              });
          }
          else {
            especificarPlataforma = `Lo siento *${nameUser}* 🤔me debes especificar en tu pregunta la plataforma a la que te refieres 💻 para poder ayudarte mejor 🤝. Ya sea *Ruah* o *Tau*`
            client
              .reply(
                message.from, especificarPlataforma,
                message.id.toString()
              )
              .then((result) => {
                chat.lastReceivedKey._serialized
                console.log('Result: ', result); //return object success
              }).catch((erro) => {
                console.error('Error when sending: ', erro); //return object error
              });
            await cliente.query("update mensajes set msj_recibido='" + especificarPlataforma + "' where id='" + idDataMensaje + "'")

          }
        } catch (error) {
          console.log(error);
        }
      }
      /**FIN VALIDACION PLATAFORMA */

      /** FIN DE LOS METODOS */

      //TODO: COMANDOS

      let estadisticas = async () => {
        let cont1 = await cliente.query("SELECT count(puntaje)FROM nps where puntaje = 1");
        let cont2 = await cliente.query("SELECT count(puntaje)FROM nps where puntaje = 2");
        let cont3 = await cliente.query("SELECT count(puntaje)FROM nps where puntaje = 3");
        let cont4 = await cliente.query("SELECT count(puntaje)FROM nps where puntaje = 4");
        let cont5 = await cliente.query("SELECT count(puntaje)FROM nps where puntaje = 5");
        let cont6 = await cliente.query("SELECT count(puntaje)FROM nps where puntaje = 6");
        let cont7 = await cliente.query("SELECT count(puntaje)FROM nps where puntaje = 7");
        let cont8 = await cliente.query("SELECT count(puntaje)FROM nps where puntaje = 8");
        let cont9 = await cliente.query("SELECT count(puntaje)FROM nps where puntaje = 9");
        let cont10 = await cliente.query("SELECT count(puntaje)FROM nps where puntaje = 10");

        contadores = cont1.rows;
        let mapQueryContadores = contadores.map((cont) => cont.count);
        mapQueryContadores = parseInt(mapQueryContadores)
        contadores2 = cont2.rows;
        let mapQueryContadores2 = contadores2.map((cont) => cont.count);
        mapQueryContadores2 = parseInt(mapQueryContadores2)
        contadores3 = cont3.rows;
        let mapQueryContadores3 = contadores3.map((cont) => cont.count);
        mapQueryContadores3 = parseInt(mapQueryContadores3)
        contadores4 = cont4.rows;
        let mapQueryContadores4 = contadores4.map((cont) => cont.count);
        mapQueryContadores4 = parseInt(mapQueryContadores4)
        contadores5 = cont5.rows;
        let mapQueryContadores5 = contadores5.map((cont) => cont.count);
        mapQueryContadores5 = parseInt(mapQueryContadores5)
        contadores6 = cont6.rows;
        let mapQueryContadores6 = contadores6.map((cont) => cont.count);
        mapQueryContadores6 = parseInt(mapQueryContadores6)
        contadores7 = cont7.rows;
        let mapQueryContadores7 = contadores7.map((cont) => cont.count);
        mapQueryContadores7 = parseInt(mapQueryContadores7)
        contadores8 = cont8.rows;
        let mapQueryContadores8 = contadores8.map((cont) => cont.count);
        mapQueryContadores8 = parseInt(mapQueryContadores8)
        contadores9 = cont9.rows;
        let mapQueryContadores9 = contadores9.map((cont) => cont.count);
        mapQueryContadores9 = parseInt(mapQueryContadores9)
        contadores10 = cont10.rows;
        let mapQueryContadores10 = contadores10.map((cont) => cont.count);
        mapQueryContadores10 = parseInt(mapQueryContadores10)


        let totalcont = mapQueryContadores + mapQueryContadores2 + mapQueryContadores3 + mapQueryContadores4 + mapQueryContadores5 + mapQueryContadores6 + mapQueryContadores7 + mapQueryContadores8 + mapQueryContadores9 + mapQueryContadores10

        setTimeout(() => {
          client
            .sendText(message.from, `*${nameUser}*\nEscribiste una palabra clave ...\n*TE TENGO LOS SIGUIENTES RESULTADOS ACTUALIZADOS DE LAS ENCUESTAS👇👇👇*`)
        }, 2000);
        setTimeout(() => {
          client
            .sendText(message.from, `*TOTAL DE PERSONAS ENCUESTADAS ➡️ ${totalcont}*\n*NPS 0➡️MUY POCO PROBABLE😔😔*\n*NPS 10➡️MUY PROBABLE🔥🔥* \n*Puntaje NPS   |   Personas votaron*\n 
      NPS 1️⃣  *|*  ${mapQueryContadores} Personas\n 
      NPS 2️⃣  *|*  ${mapQueryContadores2} Personas\n 
      NPS 3️⃣  *|*  ${mapQueryContadores3} Personas\n
      NPS 4️⃣  *|*  ${mapQueryContadores4} Personas\n
      NPS 5️⃣  *|*  ${mapQueryContadores5} Personas\n
      NPS 6️⃣  *|*  ${mapQueryContadores6} Personas\n
      NPS 7️⃣  *|*  ${mapQueryContadores7} Personas\n
      NPS 8️⃣  *|*  ${mapQueryContadores8} Personas\n
      NPS 9️⃣  *|*  ${mapQueryContadores9} Personas\n
      NPS 🔟  *|*  ${mapQueryContadores10} Personas`)
        }, 2000);
      }

      let ayudaEncuesta = () => {
        // /**ENCUESTA AYUDA */
        // cliente.query("update estadosmessages set estado='encuesta2' where telefono='" + number + "'")
        setTimeout(() => {
          client.sendText(message.from, `${nameUser} *¡Has escrito el comando para encuesta!* 🤖🤖`)
        }, 2000);
        cliente.query("update estadosmessages set estado='encuesta' where telefono='" + number + "'")
        npsEncuesta()


      }

      let menuPrincipal = async () => {
        cliente.query("update estadosmessages set estado='start' where telefono='" + number + "'")
        setTimeout(() => {
          client.sendText(message.from, `${nameUser} *¡Has escrito el comando para el menú principal!*\nTe muestro mis ayudas a continuación: 👇👇\n\n● 🔒Cambio de contraseña para las plataformas Ruah, Tau y Zeus.\n● 📧Información de correo electronico institucional.\n\n Mis comandos son los siguientes 👇👇\n*● Opciones:* Muestra de nuevo el menú para que puedas seguir utilizando mi servicio 🤓\n*● AyudarEncuesta:* Califica mi servicio y ayúdame a mejorar 🤗 \n*● Mejoras:* Sugiere alguna opción nueva para que yo la incorpore 🤝\n*● AcercaDe:* Obtén información sobre mí y mis desarrolladores 🤩\n
                    ¿En que te puedo colaborar? 🤔`)
        }, 2000);
      }

      const npsEncuesta2 = async () => {
        await cliente.query("update estadosmessages set estado='votante' where id='" + idData + "'")
        setTimeout(() => {
          client.sendText(message.from, `${nameUser} ¿Cuál es tu rol en la Universidad🤔?\n\n*E: Estudiante*\n*D: Docente*\n*A: Administrativo*`)
        }, 2000);
      }

      const acercaDe = async () => {
        cliente.query("update estadosmessages set estado='start' where telefono='" + number + "'")
        setTimeout(() => {
          client.sendText(message.from, `🤩 *Esta idea fue desarrollada por un equipo de estudiantes de Ingeniería de Sistemas y su asesor como parte de una investigación de grado, con el fin de contribuir a los procesos académicos en la Jefatura de Software, aportando soluciones innovadoras y eficientes.* 💪\n\nLos desarrolladores fueron:\nBrayan Camilo Jamanoy Bacca 👉👉 3238146048\nJeisson Fernando Montenegro Rosero\nJorge Albeiro Rivera Rosero\n\n\n*UNICESMAG 2023*`)
        }, 2000);
      }

      const mejoras = async () => {
        cliente.query("update estadosmessages set estado='start' where telefono='" + number + "'")
        setTimeout(() => {
          client.sendText(message.from, `${nameUser} ¡*Has escrito una palabra clave!*\n\nEsto me ayudará a mejorar mis futuras actualizaciones\n 🤩😎 🤔*UNICESMAG 2023*\n\n Ingresa a este link 👇👇\nhttps://forms.gle/uGTCf9sV6gnJxHKU9`)
        }, 2000);
      }
      //FIN COMANDOS



      /**TODO: VALIDA SI EL NUMERO EXISTE EN LA DB  DE ESTADOS*/
      const res = await cliente.query("select * from estadosmessages where telefono='" + number + "'")
      numberTel = res.rows;
      let mapQuerymsj = numberTel.map((test) => test.telefono);
      let mapQueryId = numberTel.map((test) => test.id);
      //console.log(mapQuerymsj[0] + " es el numero");
      const numero = mapQuerymsj[0] ////en esta variable esta el numero de telefono
      const idData = mapQueryId[0] //en esta variable esta el id quye tiene el registro en la db
      console.log(numero + " es el numeroooooooooo");
      console.log(idData + " es el ide de la base de datos");

      //FIN VALIDACIÓN

      if (number != numero) {
        setTimeout(() => {

          client
            .sendImage(
              number,
              './images/funcionalidad.jpeg',
              'Mi funcionalidad',
              '```👋🏻 Hola! 🤖 Soy Adel, el asistente virtual de la Universidad CESMAG 🏫. 💻 Comprendo el lenguaje humano, así que puedes escribirme o hablarme. 🗣️ Te dejo este ejemplo de mi funcionalidad. 🤳👆```'
            )
            .then((result) => {
              console.log('Result: ', result); //return object success
            })
            .catch((erro) => {
              console.error('Error when sending: ', erro); //return object error
            });
        }, 1000);

        await cliente.query("insert into estadosmessages(id,telefono,estado) values (DEFAULT, '" + number + "', 'start')")

        setTimeout(() => {
          client
            .sendText(message.from, `Me alegra mucho conocerte * ${nameUser} * 🤗\n Estoy aquí para ayudarte con los siguientes temas: \n
    ● 🔒Cambio de contraseña para las plataformas Ruah, Tau y Zeus.\n
    ● 📧Información de correo electronico institucional.\n
    ¿En que te puedo colaborar ? 🤔`)
        }, 3000);

        setTimeout(() => {
          client
            .sendText(message.from, `🔥🔥🔥 * _Igualmente, te comento que integro unos comandos ocultos para que puedas personalizar tu experiencia.Envíame un mensaje cuando necesites mirar cualquiera de los comandos para que te ayude._ * 🤩\nLos comandos disponibles son: \n\n *● Opciones:* Muestra de nuevo el menú para que puedas seguir utilizando mi servicio 🤓\n *● AyudarEncuesta:* Califica mi servicio y ayúdame a mejorar 🤗 \n *● Mejoras:* Sugiere alguna opción nueva para que yo la incorpore 🤝\n *● AcercaDe:* Obtén información sobre mí y mis desarrolladores 🤩`)
        }, 5000);

      }

      //TODO: OBTENER EL ESTADO
      const resEstado = await cliente.query("select estado from estadosmessages where telefono='" + number + "'")
      console.log("es del estado...............");
      estadoData = resEstado.rows;
      let mapQueryEstado = estadoData.map((estadodb) => estadodb.estado);
      const estadoDb = mapQueryEstado[0] //en esta variable esta el estado
      console.log(estadoDb + " el estado es este actual");
      //

      //TODO:LOGICA DE COMANDOS
      if (msjwp === "Adel_muestra_estadisticas" && message.isGroupMsg === false) {
        estadisticas();
      } else if (msjwp === "AyudarEncuesta" || msjwp === "ayudarencuesta" && message.isGroupMsg === false) {
        ayudaEncuesta()
      } else if (msjwp === "Opciones" || msjwp === "opciones" && message.isGroupMsg === false) {
        if (estadoDb !== 'encuesta') {
          if (estadoDb !== 'espera') {
            menuPrincipal()
          }
        } else if (estadoDb !== 'espera') {
          return
        }
      } else if (msjwp === "AcerdaDe" || msjwp === "acercade" || msjwp === "Acercade" && message.isGroupMsg === false) {
        if (estadoDb !== 'encuesta') {
          if (estadoDb !== 'espera') {
            acercaDe()
          }
        } else if (estadoDb !== 'espera') {
          return
        }
      } else if (msjwp === "Mejoras" || msjwp === "mejoras") {
        if (estadoDb !== 'encuesta') {
          if (estadoDb !== 'espera') {
            mejoras()
          }
        } else if (estadoDb !== 'espera') {
          return
        }
      }
      //FIN LOGICA COMANDOS

      //TODO: VALIDACIONES DE ESTADO
      const esCorreoElectronico = correoElectronico => /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/i.test(correoElectronico);
      const correo = esCorreoElectronico(msjwp)
      if (estadoDb == 'ruah') {
        errorCorreoRuah = "⚠️¡Atención! 🧐Revisa cuidadosamente que el correo electrónico que has introducido sea correcto y válido. 🤔Inténtalo de nuevo para asegurarte de que está bien escrito."
        if (correo) {
          webScrapingRuah(msjwp, idData)
        } else {
          client
            .sendText(message.from, errorCorreoRuah)
          await cliente.query("update mensajes set msj_recibido='" + errorCorreoRuah + "' where id='" + idDataMensaje + "'")
        }
      } else if (estadoDb == 'tau') {
        errorUserTau = "Inténtalo de nuevo, recuerda que los números de documento de identidad deben ser exactos para que sean válidos. 🤓"
        if (!isNaN(msjwp)) {
          if (msjwp.length > 5 && msjwp.length <= 15) {
            webScrapingTau(msjwp, idData)
          } else {
            client
              .sendText(message.from, errorUserTau)
            await cliente.query("update mensajes set msj_recibido='" + errorUserTau + "' where id='" + idDataMensaje + "'")
          }

        } else {
          errorTau = "🤔 Un número de documento de identidad debe estar compuesto solo de números ➡️ 🔢"
          client
            .sendText(message.from, errorTau)
          await cliente.query("update mensajes set msj_recibido='" + errorTau + "' where id='" + idDataMensaje + "'")
        }


      } else if (estadoDb == 'zeus') {
        errorCorreoZeus = "⚠️¡Atención! 🧐Revisa cuidadosamente que el correo electrónico que has introducido sea correcto y válido. 🤔Inténtalo de nuevo para asegurarte de que está bien escrito."
        if (correo) {
          webScrapingZeus(msjwp, idData)
        } else {
          client
            .sendText(message.from, errorCorreoZeus)
          await cliente.query("update mensajes set msj_recibido='" + errorCorreoZeus + "' where id='" + idDataMensaje + "'")
        }

      } else if (estadoDb == 'encuesta') {
        if (!isNaN(msjwp)) {
          parseInt(msjwp)
          if (msjwp >= 0 && msjwp <= 10) {
            if (msjwp.includes(".") || msjwp.includes(",")) {
              client
                .reply(message.from, `💡Escribe un número entero del 0 al 10`, message.id)
                .then((result) => {
                  chat.lastReceivedKey._serialized
                  console.log('Result: ', result); //return object success
                }).catch((erro) => {
                  console.error('Error when sending: ', erro); //return object error
                });

            } else {
              await cliente.query("INSERT INTO nps(id, telefono, puntaje, msj_enviado_nps)VALUES (default, '" + number + "', '" + msjwp + "', '' )")
              npsEncuesta2()
            }
          } else {
            client
              .reply(message.from, `💡Escribe un número entero del 0 al 10`, message.id)
              .then((result) => {
                chat.lastReceivedKey._serialized
                console.log('Result: ', result); //return object success
              }).catch((erro) => {
                console.error('Error when sending: ', erro); //return object error
              });
          }
        } else {
          client
            .reply(message.from, `💡Escribe un número entero del 0 al 10`, message.id)
            .then((result) => {
              chat.lastReceivedKey._serialized
              console.log('Result: ', result); //return object success
            }).catch((erro) => {
              console.error('Error when sending: ', erro); //return object error
            });
        }
      } else if (estadoDb == 'votante') {
        const letra = msjwp.toUpperCase()
        if (letra == 'A' || letra == 'D' || letra == 'E') {
          msj_nps = `🙌👍 ¡Muchas gracias por tomarte el tiempo para participar en esta encuesta! 🤩 Tu opinión es invaluable para nosotros. ¡Muchas gracias por contribuir con tu punto de vista! 🤝💯`, message.id
          client
            .reply(message.from, msj_nps, message.id)
            .then((result) => {
              chat.lastReceivedKey._serialized
              console.log('Result: ', result); //return object success
            }).catch((erro) => {
              console.error('Error when sending: ', erro); //return object error
            });
          // await cliente.query("update nps set msj_enviado_nps='" + msj_nps + "', votante='" + letra + "' where id='" + idDataNPS + "'")
          // await cliente.query("update estadosmessages set estado='start' where id='" + idData + "'")

          const idMensajes = await cliente.query("select * from nps where telefono='" + number + "' ORDER BY id DESC")
          todoMensaje = idMensajes.rows;
          let mapQueryIdMensajes = todoMensaje.map((test2) => test2.id);
          const idDataNPS = mapQueryIdMensajes[0] //en esta variable esta el id quye tiene el registro en la db MENSAJES
          await cliente.query("update nps set msj_enviado_nps='" + msj_nps + "', votante='" + letra + "' where id='" + idDataNPS + "'")
          await cliente.query("update estadosmessages set estado='start' where id='" + idData + "'")

          setTimeout(() => {
            seguirAccion = `¿Qué más puedo hacer por ti ? 🤝`
            client.sendText(message.from, seguirAccion)
          }, 1000);
        } else {
          msj_npsP = `Solo tienes permitido escribir una letra: \n * E: Estudiante *\n * D: Docente *\n * A: Administrativo * `
          client.sendText(message.from, msj_npsP)
        }

      }
      else if (estadoDb == 'espera') {
        client
          .reply(message.from, `Por favor * ${nameUser}* 🤗, ten paciencia, estoy trabajando en tu solicitud. 💪 Tendrás tu respuesta lo antes posible. 🤞 ¡Gracias!`, message.id)
          .then((result) => {
            chat.lastReceivedKey._serialized
            console.log('Result: ', result); //return object success
          }).catch((erro) => {
            console.error('Error when sending: ', erro); //return object error
          });
      } else if (estadoDb == 'opcion') {
        if (message.body == '1') {
          await client
            .sendText(message.from, `📧 Por favor, vuelve a escribir tu correo electrónico personal🔍y verifica que esté escrito correctamente 🔎.`)
          await cliente.query("update estadosmessages set estado='ruah' where id='" + idData + "'")

        } else if (message.body == '2') {
          await client
            .sendText(message.from, `¿Qué más puedo hacer por ti ? 🤝`)
          await cliente.query("update estadosmessages set estado='start' where id='" + idData + "'")
        } else {
          await client
            .sendText(message.from, `No existe la opción escrita. 🚫🤔⚠`)
        }
      } else if (estadoDb == 'opcionZeus') {
        if (message.body == '1') {
          await client
            .sendText(message.from, `📧 Por favor, vuelve a escribir tu correo electrónico personal🔍y verifica que esté escrito correctamente 🔎.`)
          await cliente.query("update estadosmessages set estado='zeus' where id='" + idData + "'")

        } else if (message.body == '2') {
          await client
            .sendText(message.from, `¿Qué más puedo hacer por ti ? 🤝`)
          await cliente.query("update estadosmessages set estado='start' where id='" + idData + "'")
        } else {
          await client
            .sendText(message.from, `No existe la opción escrita. 🚫🤔⚠`)
        }
      }
      else {
        //logica
        if (insultos_numero === 1) {
          client
            .sendText(message.from, insultos_palabra)
          await cliente.query("update mensajes set msj_recibido='" + insultos_palabra + "' where  id='" + idDataMensaje + "'")
        } else {
          //TODO: TAGS
          if (data_nocontesta === 'Nada') { //si viene una prediccion
            if (data_maxcore > "0.5") {
              if (data_tag == "Contraseña_ruah") {
                setTimeout(() => {
                  validacion_plataforma();
                }, 2000);

              }
              else if (data_tag == "Contraseña_tau") {
                setTimeout(() => {
                  validacion_plataforma();
                }, 2000);

              } else if (data_tag == "Contraseña_zeus") {
                setTimeout(() => {
                  validacion_plataforma();
                }, 2000);
              } else {
                setTimeout(async () => {
                  test = azar(data_resp);
                  // console.log(test + "testtttttttttttttttttttttttOOOOOOO");
                  client
                    .sendText(message.from, test)

                  await cliente.query("update mensajes set msj_recibido='" + test + "' where  id='" + idDataMensaje + "'")
                }, 1000);
              }
            } else {
              setTimeout(async () => {
                noCOmprende = "No entiendo lo que quieres decir, ¿podrías explicármelo de otra manera por favor? 🤔🤗"
                try {
                  client
                    .sendText(message.from, noCOmprende)
                  await cliente.query("update mensajes set msj_recibido='" + noCOmprende + "' where  id='" + idDataMensaje + "'")
                } catch (error) {
                  client
                    .sendText(message.from, noCOmprende)
                  await cliente.query("update mensajes set msj_recibido='" + noCOmprende + "' where  id='" + idDataMensaje + "'")
                }
              }, 2000);


            }
          } else {
            client
              .sendText(message.from, data_nocontesta)
            await cliente.query("update mensajes set msj_recibido='" + data_nocontesta + "' where  id='" + idDataMensaje + "'")
          }
        }
      }
    } else if (message.type == "ciphertext") {
      await cliente.query("insert into estadosmessages(id,telefono,estado) values (DEFAULT, '" + number + "', 'start')")

      setTimeout(() => {

        client
          .sendImage(
            number,
            './images/funcionalidad.jpeg',
            'Mi funcionalidad',
            '```👋🏻 Hola! 🤖 Soy Adel, el asistente virtual de la Universidad Cesmag 🏫. 💻 Comprendo el lenguaje humano, así que puedes escribirme o hablarme. 🗣️ Te dejo este ejemplo de mi funcionalidad. 🤳👆```'
          )
          .then((result) => {
            console.log('Result: ', result); //return object success
          })
          .catch((erro) => {
            console.error('Error when sending: ', erro); //return object error
          });
      }, 1000);
      setTimeout(() => {
        client
          .sendText(message.from, `Me alegra mucho conocerte * ${nameUser}* 🤗\n Estoy aquí para ayudarte con los siguientes temas: \n
● 🔒Cambio de contraseña para las plataformas Ruah, Tau y Zeus.\n
● 📧Información de correo electronico institucional.\n
¿En que te puedo colaborar ? 🤔`)
      }, 3000);

      setTimeout(() => {
        client
          .sendText(message.from, `🔥🔥🔥 * _Igualmente, te comento que integro unos comandos ocultos para que puedas personalizar tu experiencia.Envíame un mensaje cuando necesites mirar cualquiera de los comandos para que te ayude._ * 🤩\nLos comandos disponibles son: \n\n *● Opciones:* Muestra de nuevo el menú para que puedas seguir utilizando mi servicio 🤓\n *● AyudarEncuesta:* Califica mi servicio y ayúdame a mejorar 🤗 \n *● Mejoras:* Sugiere alguna opción nueva para que yo la incorpore 🤝\n *● AcercaDe:* Obtén información sobre mí y mis desarrolladores 🤩`)
      }, 5000);


    } else {
      //var nameUser = message.chat.contact.pushname;
      client
        .reply(
          message.from,
          `Lo siento * ${nameUser}*, no te comprendo 🤷‍♂️. Por el momento solo comprendo lo que envias por audio 🔊 o escrito 📝.`,
          message.id.toString()
        )
        .then((result) => {
          chat.lastReceivedKey._serialized
          console.log('Result: ', result); //return object success
        }).catch((erro) => {
          console.error('Error when sending: ', erro); //return object error
        });

      client
        .sendText(message.from)
        .then((result) => {
          console.log("result: ", result);
        })
        .catch((erro) => {
          console.error("Error when sendig: ", erro);
        });
    }

  });
}
