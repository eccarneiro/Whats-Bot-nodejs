const qrcode = require('qrcode-terminal');
// const { Client, NoAuth } = require('whatsapp-web.js');
const DEV = false;
const { Client, NoAuth } = DEV ? require('./mock') : require('whatsapp-web.js');
const client = new Client({
    authStrategy: new NoAuth()
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});
let scheduleAppointment = {
    datetime: null,
    status: null,  // waitingForDateTime, confirmed, canceled
};
let stage = 'mainMenu';
const answerMainMenu = async (message) => {
    const inputs = ['oi', 'ola', 'eai', 'salve', 'opa', 'bom dia', 'boa tarde', 'boa noite', 'oie', 'slv', 'dae', 'e ai',]
    if (inputs.some(input => input === message.body.toLowerCase())) {
        await message.reply('Olá! Digite menu para ver as opções disponíveis.');
    } else if (message.body === 'menu' || message.body === 'Menu') {
        await message.reply('1 - Listar serviços.\n2 - Verificar meu agendamento. \n3 - Redes Sociais.');
        stage = 'mainMenuOptions';
    }
}
const answerMainMenuOptions = async (message) => {
    if (message.body === '1') {
        await message.reply('1 - Corte de Cabelo.\n2 - Barba.\n3 - Corte e barba.\n 4 - Voltar para o menu principal.');
        stage = 'servicos';
    } else if (message.body === '2') {
        await message.reply('Você não possui agendamentos. Deseja marcar ? \n 1 - Sim \n 2 - Não\n 3 - Cancelar agendamento.');
        stage = 'agendamento';
    } else if (message.body === '3') {
        await message.reply('Instagram: @barbearia\nFacebook: Barbearia');
        await client.sendMessage(message.from, 'Voltando para o menu de opções.\n 1 - Corte de Cabelo.\n2 - Barba.\n3 - Corte e barba.');
        stage = 'mainMenuOptions';

    } else if (message.body === '4') {
        await client.sendMessage(message.from, 'Voltando para o menu principal...');
        stage = 'mainMenu';
    }
}
const answerAgendamento = async (message) => {
    if (message.body === '1') {
        await message.reply('Digite a data desejada no formato "DD/MM/YYYY".');
        stage = 'waitingForDate';
        scheduleAppointment.status = 'waitingForDate';
    } else if (message.body === '2') {
        await message.reply('Voltando para o menu principal. Digite menu para ver as opções disponíveis.');
        stage = 'mainMenu';
    }
}

const answerDate = async (message) => {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    const matches = message.body.match(regex);
    if (matches) {
        scheduleAppointment.datetime = matches[0];
        await message.reply('Digite o horário desejado no formato "HR:MN".');
        stage = 'waitingForTime';
    } else {
        await client.sendMessage(message.from, 'Data inválida. Digite a data desejada no formato "DD/MM/YYYY".');
    }

}
const answerTime = async (message) => {
    const regexTime = /^\d{2}:\d{2}$/;
    const matches = message.body.match(regexTime);
    if (matches) {
        scheduleAppointment.datetime += ` às ${matches[0]}Hrs. Obrigado pela preferência!`;
        await message.reply(`Agendamento confirmado para o dia ${scheduleAppointment.datetime}.`);
        scheduleAppointment.status = 'confirmed';
        stage = 'mainMenu';
    } else {
        await client.sendMessage(message.from, 'Horário inválido. Digite o horário desejado no formato "HR:MN".');
    }
}
const answerServicos = async (message) => {
    if (message.body === '1') {
        await message.reply('Corte de Cabelo: R$ 20,00');
    } else if (message.body === '2') {
        await message.reply('Barba: R$ 15,00');
    } else if (message.body === '3') {
        await message.reply('Corte e barba: R$ 30,00');
    }
    await client.sendMessage(message.from, 'Voltando para o menu principal. Digite menu para ver as opções disponíveis.');
    stage = 'mainMenu';
}

const answer = async (message) => {
    if (stage === 'mainMenu') {
        await answerMainMenu(message);
    } else if (stage === 'mainMenuOptions') {
        await answerMainMenuOptions(message);
    } else if (stage === 'servicos') {
        await answerServicos(message);
    } else if (stage === 'agendamento') {
        await answerAgendamento(message);
    } else if (stage === 'waitingForDate') {
        await answerDate(message);
    } else if (stage === 'waitingForTime') {
        await answerTime(message);
    }
}
client.on('message', async (message) => {
    await answer(message);
});

client.initialize();


async function test() {
    await client.emit('message', { body: 'oi' })
    await client.emit('message', { body: 'Menu' })
    await client.emit('message', { body: '2' })
    await client.emit('message', { body: '1' })
    await client.emit('message', { body: '10/03/2024' })
    await client.emit('message', { body: '13:25' })
}
DEV && test();
