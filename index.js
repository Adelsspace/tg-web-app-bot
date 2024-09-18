const TOKEN = require("./TOKEN");
const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const cors = require("cors");

const bot = new TelegramBot(TOKEN, { polling: true });
const app = express();

app.use(express.json());
app.use(cors());

const webAppUrl = "https://astgwebapp.netlify.app";

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "/start") {
    await bot.sendMessage(
      chatId,
      "Добро пожаловать, ниже появится кнопка заполнения формы",
      {
        reply_markup: {
          keyboard: [
            [
              {
                text: "Заполнить форму!",
                web_app: { url: webAppUrl + "/form" },
              },
            ],
          ],
        },
      }
    );

    await bot.sendMessage(chatId, "Добро пожаловать", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Записаться на курсы", web_app: { url: webAppUrl } }],
        ],
      },
    });
  }

  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data);
      await bot.sendMessage(chatId, "Received your message");
      await bot.sendMessage(
        chatId,
        "Ваша специализация: " + data?.specialization
      );
      await bot.sendMessage(chatId, "Ваша уровень: " + data?.grade);
      await bot.sendMessage(
        chatId,
        "Интервью будет на языке: " + data?.language
      );
      console.log(data, "ASDASDASD");
      setTimeout(async () => {
        await bot.sendMessage(
          chatId,
          "После метча вам придет сообщение с временем интервью"
        );
      }, 3000);
    } catch (e) {
      console.log(e);
    }
  }
});

app.post("/web-data", async (req, res) => {
  const { products, totalPrice, queryId } = req.body;

  try {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Успешная заявка",
      input_message_content: {
        message_text: `Поздравляю, вы успешно подавли заявку на курсы на сумму ${totalPrice} вы заказали: ${products
          .map((item) => item.title)
          .join(", ")} `,
      },
    });
    return res.status(200).json({});
  } catch (e) {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Не удалось отправить заявку",
      input_message_content: {
        message_text: "Не удалось отправить заявку",
      },
    });
    return res.status(500).json({});
  }
});

const PORT = 8000;
app.listen(PORT, () => console.log(`server started on port ${PORT}`));
