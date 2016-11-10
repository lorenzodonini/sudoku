//author: Lorenzo Donini	lorenzo.donini90@gmail.com

var N = 9;
var BOX = 3;
var game;
var time;
var interval;
var hard = 18;
var medium = 25;
var easy = 33;

//CREATION CALLED BY ONLOAD
function createTable()
{
	game = new Array(N);
	for(var i=0; i<N; i++)
		{
			game[i] = new Array(N);
			for(var j=0; j<N; j++)
				{
					game[i][j] = 0;
				}
		}
	initializeSudoku();
	printTable();
	startTimer();
}

//TIMER FUNCTIONS
function startTimer()
{
	time = new Array(3);
	time[0] = 0;
	time[1] = 0;
	time[2] = 0;
	updateTimer();
	interval = setInterval(increaseTimer, 1000);
}

function increaseTimer()
{
	time[0]++;
	if(time[0] == 60)
	{
		time[0] = 0;
		time[1]++;
		if(time[1] == 60)
		{
			time[1] = 0;
			time[2]++;
		}
	}
	updateTimer();
}

function updateTimer()
{
	var timeLabel = document.getElementById("timeLabel");
	var str = "";
	if(time[2] < 10)
	{
		str += "0";
	}
	str+= time[2]+":";
	if(time[1] < 10)
	{
		str+= "0";
	}
	str+= time[1]+":";
	if(time[0] < 10)
	{
		str+= "0";
	}
	str+= time[0]+"";
	timeLabel.innerHTML = "Time elapsed: "+str;
	return str;
}

function stopTimer()
{
	window.clearInterval(interval);
}

//INIT UTILITIES FUNCTIONS
function checkBounds(str, i, j)
{
	var found = 0;
	if(i == 0)
	{
		str+=" topDivider";
	}
	if((i%3)==2)
	{
		str+=" bottomDivider";
	}
	if(j == 0)
	{
		str+=" leftDivider";
	}
	if((j%3)==2)
	{
		str+=" rightDivider"
	}
	return str;
}

function printTable()
{
	var table = document.getElementById("sudokuTable");
	var str = "";
	for(var i=0; i<N; i++)
		{
			str+="<tr>";
			for(var j=0; j<N; j++)
				{
					str+="<td class='";
					str = checkBounds(str, i, j);
					str+="'>";
					str+= "<input type='text' onkeyup='checkSyntax(this, "+i+", "+j+")'";
					if(game[i][j]>0)
					{
						str+= " class='closedCell'";
						str+= " readonly='readonly'";
						str+= " value='"+game[i][j]+"'</input></td>";
					}
					else
					{
						str+="value=''</input></td>";
					}
				}
			str+="</tr>";
		}
	table.innerHTML = str;
}

//INITIALIZING SUDOKU, STATIC VERSION OR RANDOMIZED
function initializeSudoku()
{
	/*game[0][0] = 7;
	game[0][2] = 8;
	game[0][6] = 3;
	game[1][3] = 2;
	game[1][5] = 1;
	game[2][0] = 5;
	game[3][1] = 4;
	game[3][7] = 2;
	game[3][8] = 6;
	game[4][0] = 3;
	game[4][4] = 8;
	game[5][3] = 1;
	game[5][7] = 9;
	game[6][1] = 9;
	game[6][3] = 6;
	game[6][8] = 4;
	game[7][4] = 7;
	game[7][6] = 5;*/
	var num, row, column;
	//Default difficulty set is hard, still need to implement a custom dialog
	//with JQuery in order to ask the user for a difficulty level
	for(i=0; i<9; i++)
	{
		row = Math.floor(i / 3);
		column = i % 3;
		num = generateRandom(1, 9);
		while(!backtrack(row, column, num))
		{
		  num = generateRandom(1, 9);
		}
		game[row][column]=num;
	}
	try {
	  solve(0, 0);
	}
	catch(err) {
	  showRandomCells();
	  return;
	}
}

function showRandomCells()
{
  var toShow = new Array(N*N);
  var i=0;
  var ran;
  while(i<medium)
  {
    ran = generateRandom(0, 80);
    while(toShow[ran] != null && toShow[ran] == true)
    {
      ran = generateRandom(0, 80);
    }
    toShow[ran] = true;
    i+=1;
  }
  
  for(i=0; i<N*N; i++)
  {
    if(toShow[i] == null)
    {
      game[Math.floor(i/N)][i%N]=0;
    }
  }
}

function generateRandom(min, max)
{
	return Math.floor((Math.random()*max) + min);
}

//INPUT LISTENER
function checkSyntax(from, row, column)
{
	from.value = from.value.replace(/[^1-9]+/g, "");
	if(from.value.length > 1)
	{
		from.value = from.value.charAt(0);
	}
	game[row][column] = parseInt(from.value);
}

//BUTTON LISTENERS
function clearTable()
{
	var inputs = document.forms[0];
	for(var i=0; i<inputs.length; i++)
	{
		var element = inputs[i];
		if(!element.readOnly)
		{
			game[Math.floor(i/N)][(i%N)] = 0;
			element.value = "";
		}
	}
}

function doCorrection()
{
	var k=1;
	var boxr, boxc;
	var res, i;
	for(i=0; i<N; i++)
	{
		res = checkOrthogonal(i, i);
		if(res == 0)
		{
			alert("Incomplete Sudoku!");
			return;
		}
		else if(res < 0)
		{
			alert("Errors were found!");
			return;
		}
		boxr = (Math.floor(i / 3))*BOX;
		boxc = (i % 3)*BOX;
		res = checkBox(boxr, boxc);
		if(res == 0)
		{
			alert("Incomplete Sudoku!");
			return;
		}
		else if(res < 0)
		{
			alert("Errors were found!");
			return;
		}
	}
	stopTimer();
	alert("Sudoku solved correctly in "+updateTimer()+"!");
}

//ENUMERATION AND BACKTRACKING ALGORITHMS
function solveSudoku()
{
	var boxr, boxc, i, res, yn;
	for(i=0; i<N; i++)
	{
		res = checkOrthogonal(i, i);
		if(res < 0)
		{
			yn = confirm("The sudoku has errors. Do you want to see the solution?");
			if(yn)
			{
				clearTable();
				solve(0,0);
			}
			return;
		}
		boxr = (Math.floor(i / 3))*BOX;
		boxc = (i % 3)*BOX;
		res = checkBox(boxr, boxc);
		if(res < 0)
		{
			yn = confirm("The sudoku has errors. Do you want to see the solution?");
			if(yn)
			{
				clearTable();
				solve(0,0);
			}
			return;
		}
	}
	try
	{
	  solve(0, 0);
	}
	catch(err)
	{
	  alert("Sudoku solved. You are a loser!");
	}
}

function solve(row, column)
{
	if(row == N)
	{
		solvedTable();
		stopTimer();
		throw new Error("Sudoku solved!");
	}
	if(game[row][column] > 0)
	{
		next(row, column);
		return;
	}
	for(var i=1; i<= N; i++)
	{
		if(backtrack(row, column, i))
		{
			game[row][column] = i;
			next(row, column);
		}
	}
	game[row][column] = 0;
}

function next(row, column)
{
	column++;
	if(column == N)
	{
		column = 0;
		row++;
	}
	solve(row, column);
}

function backtrack(row, column, k)
{
	var boxr = row - (row % BOX);
	var boxc = column - (column % BOX);
	for(var i=0; i<N; i++)
	{
		if(game[row][i] == k || game[i][column] == k)
			return false;
		if(game[Math.floor(i/BOX) + boxr][i%BOX + boxc] == k)
			return false;
	}
	return true;
}

//FUNCTIONS TO BE USED DURING CORRECTION
function checkOrthogonal(row, column)
{
	var temp = Array(N+1);
	var i=0;
	for(i=0; i<=N; i++)
	{
		temp[i] = 0;
	}
	for(i=0; i<N; i++)
	{
		if(temp[game[row][i]]>1 && game[row][i] != 0)
			return -1;
		if(temp[game[i][column]]>1 && game[i][column] != 0)
			return -1;
		temp[game[row][i]] += 1;
		temp[game[i][column]] += 1;
	}
	if(temp[0] > 0)
		return 0;
	return 1;
}

function checkBox(boxr, boxc)
{
	var temp = Array(N+1);
	var i=0;
	var x, y;
	for(i=0; i<=N; i++)
	{
		temp[i] = 0;
	}
	for(var i=0; i<N; i++)
	{
		x = Math.floor(i/BOX) + boxr;
		y = i%BOX + boxc;
		if(temp[game[x][y]]>0 &&
				game[x][y]!=0)
			return -1;
	}
	if(temp[0] > 0)
		return 0;
	return 1;
}

//TABLE UPDATE FUNCTION
function solvedTable()
{
	var inputs = document.forms[0];
	for(var i=0; i<inputs.length; i++)
	{
		var element = inputs[i];
		if(!element.readOnly)
		{
			element.value = game[Math.floor(i/N)][i%N];
		}
	}
}