/*
Author : Ahmed Jaradat
Email : ahlinux@gmail.com
License : Do what you want with this code

Description:
Tic Tac Toe game implementation, just instantiate this class with a target selector which is a jquery selector for the container
and width which is the game width
*/

function TicTacToe( targetSelector, width){
    width=width===null?3:width;
    // Target div to insert the game into
    this.targetSelector = targetSelector;
    this.targetObj = $(targetSelector);
    // who will start the game the machine or the user
    this.userStart = true;
    // Game width
    this.width = width;
	
    // Classes to create for the game
    this.rowClass = "t3-row";
    this.resultClass= "t3-result";
    this.resetClass="t3-reset";
    this.solutionClass="t3-solution";

    this.BASE_CELL = 0;		// free cell
    this.MACHINE_CELL = 1;	// selected by automatic player
    this.PLAYER_CELL = 2;	// selected by the user
    this.classes = [
        "t3-cell",
        "t3-player",
        "t3-machine"
    ];
	
    this.cellObjectsArray = null; 	// Object array contains fast access for all the HTML objects for cells
    this.userTurn = true;			// User turn or Machine turn
    this.last_click = [-1,-1];		// Last click coordinates
    var self = this;

    /*
		Call back function that can be override; and called on success with res array of the cells of the complete line
	*/
    this.done = function(res){
        resstr = ""
        for(i=0;i<res.length;i++)
            resstr +="("+res[i][0]+","+res[i][1]+"),"
        $(self.targetObj).find('.'+self.resultClass).html("Solution Found at:"+resstr);
        self.highlight_result( res )
    };
    
    
    this.init = function(){
        self.cellObjectsArray = new Array(self.width);
        for (i=0;i<self.width;i++){
            self.cellObjectsArray[i] = new Array(self.width);
            for(j=0;j<self.width;j++){
                self.cellObjectsArray[i][j] = null;
            }
        }
    };
	
	// User click handler
    this.user_click = function(){
        if (! self.userTurn)
            return;       
        if ($(this).data('t3_status') != self.BASE_CELL )
            return;
        
        self.userTurn = false;         
        objIdx = $(this).index('.'+self.classes[self.BASE_CELL]);
        objx = objIdx%self.width;
        objy = Math.floor(objIdx/self.width);
        self.mark_cell(objy, objx, self.PLAYER_CELL)
    };
    
	/*
		Check for complete lines or win line after each click; or create an array of how much remain in each direction
	*/
    this.checkWin = function(){
        cHorz = cVert = cDiog1= cDiog2 = self.width;
        for(var i=0;i<self.width;i++){
            if ($(self.cellObjectsArray[self.last_click[1]][i]).data('t3_status') == self.last_click[2] )
                cHorz--;
            if ($(self.cellObjectsArray[i][self.last_click[0]]).data('t3_status') == self.last_click[2])
                cVert--;
            // first diagonal line
            if ($(self.cellObjectsArray[i][i]).data('t3_status') == self.last_click[2])
                cDiog1--;
            if ($(self.cellObjectsArray[i][self.width-i-1]).data('t3_status') == self.last_click[2])
                cDiog2--;
        }
        if ( cVert && cHorz && cDiog1 && cDiog2)
            return [-1,cVert, cHorz, cDiog1, cDiog2];
        solution =[]
        for( var i=0;i<self.width;i++){
            if (!cHorz)
                solution.push( [self.last_click[1],i]);
            else if ( !cVert )
                solution.push( [i, self.last_click[0]]);
            else if ( !cDiog1)
                solution.push([i,i]);
            else
                solution.push([i,self.width-i-1])
        }
        return solution;
    }
    // Create function, that create the grid and assing handler ..etc
    this.create = function(){
        for(i=0;i<self.width;i++){
            self.targetObj.append('<div class="'+self.rowClass+'"></div>');
            rowObj = self.targetObj.find("."+self.rowClass).last();
            for(j=0;j<self.width;j++){
                rowObj.append('<div class="'+self.classes[self.BASE_CELL]+'"></div>');
            }
        }
        $(self.targetObj.find("."+self.classes[self.BASE_CELL])).each(function(idx,obj){
            $(this).unbind('click').click(self.user_click);
            $(this).data('t3_status',self.BASE_CELL);
        });     
        
        $(self.targetObj).find("."+self.rowClass).each(function(i, row){
            $(row).find("."+self.classes[self.BASE_CELL]).each(function(j,cellObj){
                self.cellObjectsArray[i][j] = cellObj;
            });
        });
        $(self.targetObj).append('<a class="'+self.resetClass+'" href="javascript:void(0)"> Reset </a>');
        $(self.targetObj).append('<div class="'+self.resultClass+'"></div>');
        
        $(self.targetObj).find('.'+self.resetClass).click(self.reset);
    };
    
	// Reset 
    this.reset = function(){
        $(self.targetObj).html('');
        self.init();
        self.start();
        
    }
	
	// Neighbours coodrinates to check around each cell
    this.neighbours =[
        [-1,-1], [-1,0], [-1,1], [0,1], [1,1],
        [1,0],[1,-1],[0,-1]
    ];

	// Highlight the success line
    this.highlight_result = function( res){
        for(i=0;i<res.length;i++){
            $(self.cellObjectsArray[res[i][0]][res[i][1]]).addClass(self.solutionClass);
        }
    }
	
	// Mark cell when user click on it or machine select it
    this.mark_cell = function( cy,cx, status){
        $(self.cellObjectsArray[cy][cx]).data('t3_status', status);
        $(self.cellObjectsArray[cy][cx]).addClass(self.classes[status]);
        self.last_click = [cx,cy,status];
        res = self.checkWin();
        if (res[0] != -1)
            return self.done(res);

        self.userTurn = status === self.MACHINE_CELL;
        if (!self.userTurn)
            self.play();
    }
    
	// Machine player function
    this.play = function(){
        // if I am starting, then I will choose something around the center
        if (self.last_click[0] === -1 ){
            cy= cx = self.width/2;
            self.mark_cell( cy, cx, self.MACHINE_CELL);
            //self.userTurn = true;
            return;
        }
        // if any line about get completed prevent it
        res = self.checkWin()
        if ( res[1]==1 || res[2]==1 || res[3] == 1 || res[4] == 1){
            cx=cy=-1;
            for(i=0;i<self.width;i++){
                //vertical
                if (res[1]==1 && $(self.cellObjectsArray[i][self.last_click[0]]).data('t3_status') == self.BASE_CELL )
                    {cy=i;cx=self.last_click[0];break;}                    
                //horizontal
                else if (res[2] == 1 && $(self.cellObjectsArray[self.last_click[1]][i]).data('t3_status') == self.BASE_CELL)
                    {cy=self.last_click[1];cx=i;break;}            
                // first diagonal line
                if (res[3] == 1 && $(self.cellObjectsArray[i][i]).data('t3_status') == self.BASE_CELL)
                    {cy=i;cx=i;break;}
                // second diagonal
                if (res[4] == 1 && $(self.cellObjectsArray[i][self.width-i-1]).data('t3_status') == self.BASE_CELL)
                    {cy=i;cx=self.width-i-1;break;}
            }
            if ( cx!=-1){
                self.mark_cell(cy, cx, self.MACHINE_CELL)
                return;
            }
        }

        // mark a block around the one that player select
        cx = self.last_click[0]; cy = self.last_click[1];
        for(var i=0;i<8;i++){
            ncx = cx + self.neighbours[i][0];
            ncy = cy + self.neighbours[i][1];
            if (  ncx >= self.width || ncy>= self.width || ncx<0 || ncy<0)
                continue
            if ($(self.cellObjectsArray[ncy][ncx]).data('t3_status') != self.BASE_CELL )
                continue
            return self.mark_cell( ncy, ncx, self.MACHINE_CELL);
        }
        // Select any empty one
        for(var i=0;i<self.width;i++)
            for(var j=0;j<self.width;j++){
                if ($(self.cellObjectsArray[i][j]).data('t3_status') != self.BASE_CELL )
                    continue
                return self.mark_cell( i,j, self.MACHINE_CELL) 
            }
    };
    this.start = function(){
        self.create();
        if (self.userStart)
            self.userTurn = true;
        else
            self.play();
        self.userStart = !self.userStart;
    };
    
    this.init();
}