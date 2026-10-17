import ts from 'typescript';

// Interpreta somente declarações de dados. Nunca transpila, importa ou executa o jogo.
export function staticModule(text, symbols={}) {
  const ast=ts.createSourceFile('source.ts',text,ts.ScriptTarget.Latest,true);
  if(ast.parseDiagnostics.length)throw new Error('TypeScript de origem inválido');
  const bindings=new Map(), values=new Map(Object.entries(symbols));
  for(const node of ast.statements){
    if(ts.isEnumDeclaration(node)){
      let next=0;values.set(node.name.text,Object.fromEntries(node.members.map(m=>{
        if(!m.initializer)return [m.name.text,next++];
        if(ts.isStringLiteral(m.initializer))return [m.name.text,m.initializer.text];
        if(ts.isNumericLiteral(m.initializer)){next=Number(m.initializer.text)+1;return [m.name.text,next-1];}
        throw new Error(`Inicializador de enum não suportado: ${node.name.text}`);
      })));
    }
    if(ts.isVariableStatement(node))for(const d of node.declarationList.declarations)if(ts.isIdentifier(d.name)&&d.initializer)bindings.set(d.name.text,d.initializer);
  }
  const resolving=new Set();
  function get(name){
    if(values.has(name))return values.get(name);
    if(!bindings.has(name)||resolving.has(name))throw new Error(`Símbolo estático não resolvido: ${name}`);
    resolving.add(name);try{const value=evaluate(bindings.get(name));values.set(name,value);return value;}finally{resolving.delete(name);}
  }
  function key(name){return ts.isComputedPropertyName(name)?evaluate(name.expression):name.text;}
  function evaluate(node){
    if(ts.isStringLiteral(node)||ts.isNoSubstitutionTemplateLiteral(node))return node.text;
    if(ts.isNumericLiteral(node))return Number(node.text);
    if(node.kind===ts.SyntaxKind.TrueKeyword)return true;
    if(node.kind===ts.SyntaxKind.FalseKeyword)return false;
    if(node.kind===ts.SyntaxKind.NullKeyword)return null;
    if(ts.isIdentifier(node))return get(node.text);
    if(ts.isCallExpression(node)&&node.expression.getText(ast)==='Object.freeze'&&node.arguments.length===1)return evaluate(node.arguments[0]);
    if(ts.isAsExpression(node)||ts.isSatisfiesExpression(node)||ts.isParenthesizedExpression(node))return evaluate(node.expression);
    if(ts.isPrefixUnaryExpression(node)&&node.operator===ts.SyntaxKind.MinusToken)return -evaluate(node.operand);
    if(ts.isPropertyAccessExpression(node)){
      const object=evaluate(node.expression);if(!Object.hasOwn(object,node.name.text))throw new Error(`Propriedade desconhecida: ${node.getText(ast)}`);return object[node.name.text];
    }
    if(ts.isNewExpression(node)&&node.expression.getText(ast)==='SetSchema')return node.arguments?.length?evaluate(node.arguments[0]):[];
    if(ts.isArrayLiteralExpression(node))return node.elements.flatMap(e=>ts.isSpreadElement(e)?evaluate(e.expression):[evaluate(e)]);
    if(ts.isObjectLiteralExpression(node)){
      const value=Object.create(null);
      for(const property of node.properties){if(ts.isSpreadAssignment(property))Object.assign(value,evaluate(property.expression));else if(ts.isPropertyAssignment(property))value[key(property.name)]=evaluate(property.initializer);else throw new Error('Propriedade não suportada');}
      return value;
    }
    throw new Error(`Expressão não permitida no leitor de dados: ${ts.SyntaxKind[node.kind]}`);
  }
  return {get,evaluate,ast,set:(name,value)=>values.set(name,value)};
}

export function pokemonClassData(text, symbols) {
  const module=staticModule(text,symbols);
  const classes=new Map(module.ast.statements.filter(ts.isClassDeclaration).map(c=>[c.name?.text,c]));
  for(const name of classes.keys())module.set(name,name);
  const classMap=module.get('PokemonClasses'), cached=new Map();
  const fields=new Set(['types','passive','evolution','evolutions','hp','atk','speed','def','speDef','maxPP','range','stars','skill','rarity','additional','regional']);
  function readClass(name){
    if(cached.has(name))return cached.get(name);
    const node=classes.get(name);if(!node)throw new Error(`Classe não encontrada: ${name}`);
    const base=node.heritageClauses?.find(h=>h.token===ts.SyntaxKind.ExtendsKeyword)?.types[0]?.expression.getText(module.ast);
    const value=base&&classes.has(base)?{...readClass(base)}:{};
    for(const member of node.members)if(ts.isPropertyDeclaration(member)&&member.initializer){
      const field=member.name.getText(module.ast);
      if(fields.has(field))value[field]=module.evaluate(member.initializer);
      if(field==='evolutionRule'&&symbols.EvolutionRuleType){
        let expression=member.initializer;
        while(ts.isAsExpression(expression)||ts.isSatisfiesExpression(expression)||ts.isParenthesizedExpression(expression))expression=expression.expression;
        const rule={type:'conditional',conditional:true};
        if(ts.isObjectLiteralExpression(expression)){
          rule.conditional=false;
          for(const property of expression.properties)if(ts.isPropertyAssignment(property)){
            const key=property.name.getText(module.ast);
            if(['type','numberRequired','moneyRequired'].includes(key))rule[key]=module.evaluate(property.initializer);
            else if(key==='itemsTriggeringEvolution'){
              try{rule.items=module.evaluate(property.initializer);}catch{rule.items=[];rule.itemsUnresolved=true;}
            }else if(['divergentEvolution','condition'].includes(key))rule.conditional=true;
          }
        }
        value.evolutionRule=rule;
      }
    }
    cached.set(name,value);return value;
  }
  return Object.fromEntries(Object.entries(classMap).map(([id,name])=>[id,readClass(name)]));
}
