# teste-full-stack

## Front-end

Requisitos obrigatórios

*	Angular 17v [⇗](https://angular.io/docs)
*	Reactive Forms  ou Template-driven Forms [⇗](https://v17.angular.io/guide/forms-overview)
*	Qualquer framework css para classes de utilidade: Bootstrap[⇗](https://getbootstrap.com/docs/5.2/utilities/api/), Tailwind[⇗](https://tailwindcss.com/)
*	Roteamento via Angular Router [⇗](https://angular.io/guide/routing-overview)
 
**Seria ótimo se ⇓**

*	Utilizasse a funcionalidade de lazy loading [⇗](https://angular.io/guide/lazy-loading-ngmodules)
*	Fizesse uso da estratégia de change detection OnPush [⇗](https://angular.io/guide/change-detection-skipping-subtrees#skipping-component-subtrees)
*	Fizesse uso dos operadores do RXJS [⇗](https://rxjs.dev/api)

O mock das telas pode ser visto através de uma cena pronta do [Excalidraw](https://drive.google.com/file/d/1oz3gPyf-lODarqtMcWDPv5yXx5wfekA1/view?usp=sharing). Você deve abrir o arquivo `embed_scente_amorsaude_front.excalidraw (2).svg</span>`. Qualquer problema, favor entrar em contato.

> Dica:  
Lembre-se que no final do dia você sempre estará escrevendo código para outros desenvolvedores.  
Deixe as mágicas para Merlin e as variáveis x,y,z para o webpack 😂
________________________________________

### [Login] História de usuário

* Como usuário, desejo ver uma tela de login com dois campos: um para e-mail e outro para senha, para poder acessar o sistema.
* Como usuário, quero poder interagir livremente com os campos de e-mail e senha na tela de login, sem receber nenhum feedback de erro, até o momento em que eu tente submeter os dados do formulário.
* Como usuário, ao deixar algum campo vazio na tela login, quero ver a mensagens de erro relacionadas ao não preenchimento desses campos.
* Como usuário, ao submeter um formulário inválido na tela de login, gostaria de receber um feedback do sistema para entender que cometi erros e poder corrigi-los.
* Como usuário, ao inserir credenciais inválidas na tela de login, espero receber algum feedback do sistema.
* Como usuário, ao enviar minhas credenciais na tela de login, gostaria de receber um feedback do sistema que minha solicitação foi enviada e está sendo processada.
* Como usuário, ao enviar minhas credenciais corretas na tela de login, gostaria de ser redirecionado para dentro do sistema.

**Seria ótimo se ⇓**

* Os dados gerais do usuário e de autenticação estejam disponíveis para toda a aplicação sem a necessidade de consultar a local storage.
* O campo de input possuir um ícone para mostrar ou esconder a senha.
* O usuário possa permanecer na aplicação sem precisar se autenticar ate o refresh_token expirar.
* O usuário fosse autenticado somente quando o formulário for válido.

________________________________________
### [CRUD - Clínica] Listagem - História de usuário
* Como usuário, desejo poder consultar todos os registros relacionados a uma entidade do sistema através de uma tabela.
* Como usuário, quero poder filtrar os dados da tabela através de um campo de texto localizado na parte superior da página de listagem, para facilitar a busca por informações específicas.
* Como usuário, desejo que a tabela na página de listagem possua paginação, para que eu possa navegar entre as diferentes páginas de resultados.
* Como usuário, ao filtrar os dados da tabela, desejo ver uma mensagem indicando que não há dados disponíveis, caso não haja registros para serem exibidos.
* Como usuário, ao visualizar cada registro na tabela da página de listagem, quero ter duas ações primárias disponíveis: "Visualizar" e "Editar".
* Como usuário, ao clicar na opção "Visualizar" para um registro específico na tabela da página de listagem, desejo ser redirecionado para uma tela de visualização, onde poderei ver os detalhes completos do registro.
* Como usuário, ao clicar na opção "Editar" para um registro específico na tabela da página de listagem, desejo ser redirecionado para uma tela de edição, onde poderei modificar as informações do registro.

**Seria ótimo se ⇓**
* O usuário puder digitar e os dados da tabela fossem filtrados somente quando o usuário pare de digitar.
* Caso exista um botão para pesquisar os dados, que o mesmo não possa ser acionado múltiplas vezes antes do término da requisição anterior.
* Buscas idênticas subsequentes não gerassem uma nova requisição para o servidor.
* A tabela pudesse ser ordenada por coluna seja localmente ou via requisição para o servidor.
* O campo de busca tivesse um ícone para limpar a busca atual e só aparecesse quando o campo estiver preenchido

________________________________________
### [CRUD - Clínica] Create/Edit - História de usuário
* Como usuário, ao submeter um formulário inválido, gostaria de receber um feedback do sistema para entender que cometi erros e poder corrigi-los.
* Como usuário, gostaria de poder interagir com a tela somente depois que todos os dados foram carregados.
* Como usuário, gostaria que os campos do formulário funcionassem em meu smartphone.
* Como usuário, desejo ser notificado quando o sistema realizou minhas ações de criar/editar com êxito ou com falhas.
* Como usuário, gostaria de poder excluir/editar um registro.

**Campos para o CRUD:**

Razão social ⇒ texto ⇒ obrigatório  
Nome fantasia ⇒ texto ⇒ obrigatório  
CNPJ ⇒ texto ⇒ texto ⇒ obrigatório  
Regional ⇒ select ⇒ obrigatório

```tsx
[
  { value: uuid, label: 'Alto tietê' },
  { value: uuid, label: 'Interior' },
  { value: uuid, label: 'ES' },
  { value: uuid, label: 'SP Interior' },
  { value: uuid, label: 'SP' },
  { value: uuid, label: 'SP2' },
  { value: uuid, label: 'MG' },
  { value: uuid, label: 'Nacional' },
  { value: uuid, label: 'SP CAV' },
  { value: uuid, label: 'RJ' },
  { value: uuid, label: 'SP2' },
  { value: uuid, label: 'SP1' },
  { value: uuid, label: 'NE1' },
  { value: uuid, label: 'NE2' },
  { value: uuid, label: 'SUL' },
  { value: uuid,, label: 'Norte' },
]
```
Data inauguração ⇒ data ⇒ obrigatório  
Ativa ⇒ checkbox  
Especialidades medicas atendidas ⇒ select múltiplo  

**Seria ótimo se ⇓**
* O componente de edição e criação fossem os mesmos componentes
* O usuário pudesse interagir com a tela somente quando todos os dados estivessem carregados
* O campo CNPJ tivesse um validador de CNPJ e tamanho máximo
* Os campos de combobox fossem carregados de maneira assíncrona separados do endpoint principal
* O campo de especialidades seja obrigatório que tenha pelo menos 5 selecionadas
________________________________________
### [CRUD - Clínica] Visualização - História de usuário
* Como usuário, gostaria de visualizar o cadastro de uma determinada entidade
* Como usuário, gostaria de ver todos os dados de forma humanizada
* Como usuário, gostaria que a tela fosse responsiva

**Seria ótimo se..**

* O usuário pudesse interagir com a tela somente quando todos os dados estivessem carregados
* Caso tenha 5 ou mais especialidades exibir um ícone de + e abrir um modal com as demais especialidades associadas aquela clínica

## Back-end

**Ferramentas:**
* Laravel 5
* Eloquent

Utilizar banco de dados MySQL ou MariaDB, criando as tabelas com a engine InnoDB. Criar as tabelas com relacionamentos. Se preferir, pode utilizar docker.

#Boa sorte.

