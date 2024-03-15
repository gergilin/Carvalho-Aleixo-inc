const puppeteer = require('puppeteer');

async function esperarUmSegundo() {
    return new Promise(resolve => {setTimeout(() => {resolve();}, 1000);});
  }

async function main(){
    //Inicializar o browser junto a uma página
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    //entrando na url solicitada no vídeo
    await page.goto('https://www.amazon.com/');
    await page.waitForSelector('#nav-global-location-popover-link');
    
    //clicando no endereço
    await page.click("#nav-global-location-popover-link")
    await page.waitForSelector('#GLUXZipUpdateInput');
    
    //editando o endereço
    await page.type('#GLUXZipUpdateInput', '11001');
    
    //confirmando edição do endereço
    await page.click('[name="glowDoneButton"]');
    
    //digitando na barra de pesquisa
    await page.type('#twotabsearchtextbox', 'garlic press');
    
    //Resolvi aguardar um segundo pois sem isso ele não consegue dar submit(tentei de várias maneiras, inclusive usando "waitForSelector").
    await esperarUmSegundo()
    
    //Clicando no botão de pesquisa
    await page.click("input[type=submit]");
    await page.waitForNavigation()

    //Repare que a todo momento até agora foi utilizado o método estou usando o método "waitForSelector" para ter certeza de que o programa vai achar os elementos.

    //no seguinte for loop, ele procura pelo index do produto na página.
    for(i=0;i<10;i++){
        //Aqui eu usei um número arbitrário de tentativas para achar um produto que não seja patrocinado
        //Enquanto eu rolava, reparei que no máximo 4 produtos seguidos eram patrocinados, então achei 10 um numero razoável.
        const div = await page.$('div[data-index="'+i+'"]');
        if(div){
            //todos os sponsored contém (".puis-label-popover.puis-sponsored-label-text")
            const sponsored = await div.$(".puis-label-popover.puis-sponsored-label-text")
            
            //tanto os sponsored quanto os não-sponsored contém (".a-icon.a-icon-star-small.a-star-small-4-5.aok-align-bottom").
            const existe = await div.$(".a-icon.a-icon-star-small.a-star-small-4-5.aok-align-bottom");
            if(sponsored){
                //Aqui verifica se é patrocinado
            }
            else if(existe){
                //Aqui verifica se existe, caso sim, continua o código
                const link = await div.$(".a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-normal")
                //clica no anúncio
                await link.click();
                await page.waitForNavigation();
                //aguarda o título do anúncio ser carregado, evitei usar o carregamento inteiro da página pois pode gerar diversos erros, além de ser muito mais lento.
                await page.waitForSelector("#productTitle")
                
                //  Usei o mesmo método de extração de valores para todos os elementos abaixo, com exceção da descrição bulletpoint
                //pois ela contem uma lista de elementos que pode mudar de tamanho de anúncio para anúncio, então vamos dar uma atenção especial a ela.
                
                //Titulo
                const title = await page.evaluate(() => {
                    const data = document.querySelector("#productTitle");
                    return data.textContent.trim()
                  });
                
                //Preço
                const preco = await page.$(".a-price.aok-align-center.reinventPricePriceToPayMargin.priceToPay")
                    //são dois elementos dentro de um elemento, o preço Cheio(p1) e o Fracionado(p2), no print juntamos os dois.
                    const p1 = await preco.evaluate(()=>{
                        const data = document.querySelector(".a-price-whole");
                        return data.textContent.trim()
                    })
                    const p2 = await preco.evaluate(()=>{
                        const data = document.querySelector(".a-price-fraction");
                        return data.textContent.trim()
                    })
                
                //Rating atual
                const rating = await page.evaluate(()=>{
                    const data = document.querySelector("#acrPopover");
                    return data.getAttribute("title")
                })
                //quanto vendeu
                const quanto_vendeu = await page.evaluate(()=>{
                    const data = document.querySelector(".a-section.social-proofing-faceout-title.social-proofing-faceout-title-alignment-left");
                    return data.textContent.trim()
                })
                //Quantidade de reviews
                const reviews = await page.evaluate(()=>{
                    const data = document.querySelector("#acrCustomerReviewText");
                    return data.textContent.trim()
                })

                //Descrição bulletpoint
                //primeiro selecionamos a lista inteira
                const bulletpoint = await page.$(".a-unordered-list.a-vertical.a-spacing-mini")
                const bullets = await bulletpoint.evaluate(() => {
                    const data = document.querySelector('ul.a-unordered-list.a-vertical.a-spacing-mini');
                    
                    //aqui nós vamos precisar obter todos os elementos da lista, para isso usamos o "querySelectorAll"
                    const sub_data = data.querySelectorAll('li');

                    //a variável "formated" é para salvarmos os bulletpoints já formatados
                    var formated = "";
                    //dentro desse forEach, pegamos cada linha da lista e formatamos, logo depois adicionamos a variável formated.
                    sub_data.forEach(row => {
                      formated+="•"+row.textContent+"\n";
                    });
                    return formated;
                  });

                //printando na ordem especificada
                console.log("Title: "+title)
                console.log("Description: \n"+bullets);
                console.log("Price: "+p1+p2)
                console.log("Bought in past month: "+quanto_vendeu)
                console.log("Reviews: "+reviews);
                console.log("Rating: "+rating);
                break;
            }
            else{
                //se não é patrocinado, mas também não existe, não há o que fazer
            }
        }
    }
    //Logo abaixo, fechamos o navegador para terminar.
    await browser.close(); 
}
main()