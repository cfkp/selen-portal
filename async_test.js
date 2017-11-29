var async=require('async');

function test1(nametask,timeout,callback) {
	console.log('начинаем выполнятся '+nametask+' timeout '+timeout);	                
        setTimeout(function() { //это асинхронный запрос типа
		
		console.log('выполнился '+nametask+' timeout '+timeout);	                
		callback(null,['результат '+nametask+' timeout '+timeout,new Date()]); //ответ
        },timeout);
}
function test2(nametask,timeout,callback) {
	console.log('начинаем выполнятся '+nametask+' timeout '+timeout);	                
        setTimeout(function() { //это асинхронный запрос типа
		
		console.log('выполнился '+nametask+' timeout '+timeout);	                
		callback(null,'результат '+nametask+' timeout '+timeout,new Date()); //ответ
        },timeout);
}

function test3(nametask,timeout,callback) {
	console.log('начинаем выполнятся '+nametask+' timeout '+timeout);	                
        setTimeout(function() { //это асинхронный запрос типа
		
		console.log('выполнился '+nametask+' timeout '+timeout);	                
//		callback("oh error",[new Date()]); //ответ
		callback("oh error",{res:'результат '+nametask+' timeout '+timeout,date:new Date()}); //ответ

        },timeout);
}

function resultShow(err,results) {
        console.log(new Date());
        if (err) {console.error("---====="+err+"=====---");}
        console.log(results);
        console.log('--------');
}

console.log(new Date());
console.log('--------');

async.parallel({one: test1.bind(null,'параллел1 задача 11',3000),two: test2.bind(null,'параллел1 задача 12',1000)},resultShow); //вызываем через 2 секунды
async.series({one: test1.bind(null,'послед задача 01',2000),two: test2.bind(null,'послед  задача 02',1000)},resultShow); //вызываем через 3 секунды первым будет one
async.parallel({one: test1.bind(null,'параллел2 задача 21',4000),two: test2.bind(null,'параллел2 задача 22',5000),three: test3.bind(null,'ошибочная задача 3',4500)},resultShow); //выпадет через 100 миллисекунд
