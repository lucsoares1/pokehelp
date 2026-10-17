// Native IDetailledPokemon[]; rows 3..1 run from front to back in TeamEditor.
// The game matches families itself, including offers whose portrait previews an evolution.
export function nativePlannerBoard(plan,state,guide=null){
  const ready=new Set(state.obtained??[]);
  const board=plan.units.filter(u=>!ready.has(u.slot)).map(u=>{
    if(!/^[A-Z0-9_]+$/.test(u.id))throw new Error('Identificador de Pokémon inválido.');
    const position=plan.formation.units.find(p=>p.slot===u.slot);
    if(!position||!Number.isInteger(position.col)||!Number.isInteger(position.row)||position.col<0||position.col>7||position.row<0||position.row>2)throw new Error('Posição do planejador inválida.');
    return {name:u.id,x:position.col,y:3-position.row,items:u.items.map(i=>i.id)};
  });
  const occupied=new Set(board.map(p=>`${p.x},${p.y}`)),names=new Set(board.map(p=>p.name));
  for(const unit of guide?.lineup??[]){
    if(!unit.temporary||unit.obtained||names.has(unit.id))continue;
    if(!/^[A-Z0-9_]+$/.test(unit.id))throw new Error('Identificador de provisório inválido.');
    let cell;
    for(let y=3;y>=1&&!cell;y--)for(let x=0;x<8;x++)if(!occupied.has(`${x},${y}`)){cell={x,y};break;}
    if(!cell)throw new Error('Lista de compras excede a capacidade do planejador.');
    board.push({name:unit.id,...cell,items:[]});occupied.add(`${cell.x},${cell.y}`);names.add(unit.id);
  }
  return board;
}
