const qrcode = require('qrcode-terminal');
const { Client, NoAuth, LocalAuth } = require('whatsapp-web.js');
const client = new Client({
    authStrategy: new NoAuth()
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

let stage = 'mainMenu';

client.on('message', async (message) => {
    if (stage === 'mainMenu') {
        const inputs = ['oi', 'ola', 'eai', 'salve', 'opa', 'bom dia', 'boa tarde', 'boa noite', 'oie', 'slv', 'dae', 'e ai',]
        if (inputs.some(input => input === message.body.toLowerCase())) {
            await message.reply('Olá! Digite menu para ver as opções disponíveis.');
        } else if (message.body === 'menu' || message.body === 'Menu') {
            await message.reply('1 - Listar serviços.\n2 - Verificar meu agendamento. \n3 - Redes Sociais.');
            stage = 'mainMenuOptions';
        }
    } else if (stage === 'mainMenuOptions') {
        if (message.body === '1') {
            await message.reply('1 - Corte de Cabelo.\n2 - Barba.\n3 - Corte e barba.\n 4 - Voltar para o menu principal.');
            stage = 'servicos';
        } else if (message.body === '2') {
            await message.reply('Você não possui agendamentos. Deseja marcar ? \n 1 - Sim \n 2 - Não');
            if (message.body === '1') {
                stage = 'agendamento';
            }
        } else if (message.body === '3') {
            await message.reply('Instagram: @barbearia\nFacebook: Barbearia');

            await client.sendMessage(message.from, 'Voltando para o menu de opções.\n 1 - Corte de Cabelo.\n2 - Barba.\n3 - Corte e barba.');
            stage = 'mainMenuOptions';

        } else if (message.body === '4') {
            await client.sendMessage(message.from, 'Voltando para o menu principal...');
            stage = 'mainMenu';
        }
    } else if (stage === 'servicos') {
        if (message.body === '1') {
            await message.reply('Corte de Cabelo: R$ 20,00');
        } else if (message.body === '2') {
            await message.reply('Barba: R$ 15,00');
        } else if (message.body === '3') {
            await message.reply('Corte e barba: R$ 30,00');
        }
        await client.sendMessage(message.from, 'Voltando para o menu principal. Digite menu para ver as opções disponíveis.');
        stage = 'mainMenu';
    } else if (stage === 'agendamento') {
        if (message.body === '1') {
            await message.reply('Digite a data e o horário desejado.');
            stage = 'marcar';
        } else if (message.body === '2') {
            await client.sendMessage(message.from, 'Voltando para o menu principal.');
            stage = 'mainMenu';
        }
    } else if (stage === 'marcar') {
        // futuramente, logica para o agendamento.
    }
});

client.initialize();

