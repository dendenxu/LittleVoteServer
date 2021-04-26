const predefinedNames = [
  'James',
  'John',
  'Robert',
  'Michael',
  'William',
  'David',
  'Richard',
  'Joseph',
  'Thomas',
  'Charles',
  'Christopher',
  'Daniel',
  'Matthew',
  'Anthony',
  'Donald',
  'Mark',
  'Paul',
  'Steven',
  'Andrew',
  'Kenneth',
  'Joshua',
  'Kevin',
  'Brian',
  'George',
  'Edward',
  'Ronald',
  'Timothy',
  'Jason',
  'Jeffrey',
  'Ryan',
  'Jacob',
  'Gary',
  'Nicholas',
  'Eric',
  'Jonathan',
  'Stephen',
  'Larry',
  'Justin',
  'Scott',
  'Brandon',
  'Benjamin',
  'Samuel',
  'Frank',
  'Gregory',
  'Raymond',
  'Alexander',
  'Patrick',
  'Jack',
  'Dennis',
  'Jerry',
  'Tyler',
  'Aaron',
  'Jose',
  'Henry',
  'Adam',
  'Douglas',
  'Nathan',
  'Peter',
  'Zachary',
  'Kyle',
  'Walter',
  'Harold',
  'Jeremy',
  'Ethan',
  'Carl',
  'Keith',
  'Roger',
  'Gerald',
  'Christian',
  'Terry',
  'Sean',
  'Arthur',
  'Austin',
  'Noah',
  'Lawrence',
  'Jesse',
  'Joe',
  'Bryan',
  'Billy',
  'Jordan',
  'Albert',
  'Dylan',
  'Bruce',
  'Willie',
  'Gabriel',
  'Alan',
  'Juan',
  'Logan',
  'Wayne',
  'Ralph',
  'Roy',
  'Eugene',
  'Randy',
  'Vincent',
  'Russell',
  'Louis',
  'Philip',
  'Bobby',
  'Johnny',
  'Bradley',
];
const { createStore } = require('../utils');
const store = createStore();

async function addnames() {
  await store.db.sync();
  console.log('[DATABASE] Database has been synced.');
  // ! STUB: DEV-INIT
  for (const name of predefinedNames) {
    var created;
    try {
      created = await store.people.create({
        name,
        voteCount: 0,
      });
      console.log(
        `[PERSON] Created entry: ${JSON.stringify(created, null, 2)}`,
      );
    } catch (error) {
      console.log(
        `[Error] Error: ${error} for name ${name}, but we'll continue. Is this name aready in the database?`,
      );
    }
  }
  // ! END OF DEV-INIT
}

addnames()
  .then(() => {
    console.log(`[INIT] Initialized names into the database`);
    process.exit();
  })
  .catch(e => {
    console.error(
      `[INIT] Error: ${e}, have your already initialized the names?`,
    );
    process.exit(1);
  });
