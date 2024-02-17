const { init } = require('./rota');
const qrcode = require('qrcode-terminal');
const DEV = true;
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

let stage = {};
const makeStage = (message) => {
    return {
        status: 'mainMenu',
        schedule: {
            status: 'waitingForDate',
            datetime: ''
        }
    };
};
const answerMainMenu = async (message) => {
    const inputs = ['oi', 'ola', 'eai', 'salve', 'opa', 'bom dia', 'boa tarde', 'boa noite', 'oie', 'slv', 'dae', 'e ai',]
    if (inputs.some(input => input === message.body.toLowerCase())) {
        await message.reply('Olá! Digite menu para ver as opções disponíveis.');
    } else if (message.body === 'menu' || message.body === 'Menu') {
        await message.reply('1 - Listar serviços.\n2 - Verificar meu agendamento. \n3 - Redes Sociais.');
        stage[message.from].status = 'mainMenuOptions';
    }
}
const answerMainMenuOptions = async (message) => {
    if (message.body === '1') {
        await message.reply('1 - Corte de Cabelo.\n2 - Barba.\n3 - Corte e barba.\n 4 - Voltar para o menu principal.');
        stage[message.from].status = 'servicos';
    } else if (message.body === '2') {
        await message.reply('Você não possui agendamentos. Deseja marcar ? \n 1 - Sim \n 2 - Não\n 3 - Cancelar agendamento.');
        stage[message.from].status = 'agendamento';
    } else if (message.body === '3') {
        await message.reply('Instagram: @barbearia\nFacebook: Barbearia');
        await client.sendMessage(message.from, 'Voltando para o menu de opções.\n 1 - Corte de Cabelo.\n2 - Barba.\n3 - Corte e barba.');
        stage[message.from].status = 'mainMenuOptions';

    } else if (message.body === '4') {
        await client.sendMessage(message.from, 'Voltando para o menu principal...');
        stage[message.from].status = 'mainMenu';
    }
}
const answerAgendamento = async (message) => {
    if (message.body === '1') {
        await message.reply('Digite a data desejada no formato "DD/MM/YYYY".');
        stage[message.from].status = 'waitingForDate';
        stage[message.from].schedule.status = 'waitingForDate';
    } else if (message.body === '2') {
        await message.reply('Voltando para o menu principal. Digite menu para ver as opções disponíveis.');
        stage[message.from].status = 'mainMenu';
    }
}

const answerDate = async (message) => {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    const matches = message.body.match(regex);
    if (matches) {
        stage[message.from].schedule.datetime = matches[0];
        await message.reply('Digite o horário desejado no formato "HR:MN".');
        stage[message.from].status = 'waitingForTime';
    } else {
        await client.sendMessage(message.from, 'Data inválida. Digite a data desejada no formato "DD/MM/YYYY".');
    }

}
const answerTime = async (message) => {
    const regexTime = /^\d{2}:\d{2}$/;
    const matches = message.body.match(regexTime);
    if (matches) {
        stage[message.from].schedule.datetime += ` às ${matches[0]}Hrs. Obrigado pela preferência!`;
        await message.reply(`Agendamento confirmado para o dia ${stage[message.from].schedule.datetime}.`);
        stage[message.from].schedule.status = 'confirmed';
        stage[message.from].status = 'mainMenu';
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
    stage[message.from].status = 'mainMenu';
}

const answer = async (message) => {
    if (stage[message.from] === undefined) {
        stage[message.from] = makeStage(message);
        await answerMainMenu(message);
        return;
    }
    if (stage[message.from].status === 'mainMenu') {
        await answerMainMenu(message);
        return;
    } else if (stage[message.from].status === 'mainMenuOptions') {
        await answerMainMenuOptions(message);
        return;
    } else if (stage[message.from].status === 'servicos') {
        await answerServicos(message);
        return;
    } else if (stage[message.from].status === 'agendamento') {
        await answerAgendamento(message);
        return;
    } else if (stage[message.from].status === 'waitingForDate') {
        await answerDate(message);
        return;
    } else if (stage[message.from].status === 'waitingForTime') {
        await answerTime(message);
        return;
    }

}
client.on('message', async (message) => {
    await answer(message);
});

client.initialize();


async function test() {
    await client.emit('message', { body: 'oi', from: 'jorge' })
    await client.emit('message', { body: 'Menu', from: 'jorge' })
    await client.emit('message', { body: '2', from: 'jorge' })
    await client.emit('message', { body: '1', from: 'jorge' })
    await client.emit('message', { body: '10/03/2024', from: 'jorge' })
    await client.emit('message', { body: '13:25', from: 'jorge' })
    await client.emit('message', { body: 'oi', from: 'Rafael' })
    await client.emit('message', { body: 'menu', from: 'Rafael' })
    await client.emit('message', { body: '2', from: 'Rafael' })
    await client.emit('message', { body: '1', from: 'Rafael' })
    await client.emit('message', { body: '11/03/2024', from: 'Rafael' })
    await client.emit('message', { body: '13:25', from: 'Rafael' })
    await client.emit('message', { body: 'oi', from: 'Fernando' })
    await client.emit('message', { body: 'menu', from: 'Fernando' })
    await client.emit('message', { body: '2', from: 'Fernando' })
    await client.emit('message', { body: '1', from: 'Fernando' })
    await client.emit('message', { body: '12/03/2024', from: 'Fernando' })
    await client.emit('message', { body: '13:25', from: 'Fernando' })
    await client.emit('message', { body: 'oi', from: 'Roberto' })
    await client.emit('message', { body: 'menu', from: 'Roberto' })
    await client.emit('message', { body: '2', from: 'Roberto' })
    await client.emit('message', { body: '1', from: 'Roberto' })
    await client.emit('message', { body: '13/03/2024', from: 'Roberto' })
    await client.emit('message', { body: '13:25', from: 'Roberto' })
    console.log(stage)
}
DEV && test();
init(() => stage)

