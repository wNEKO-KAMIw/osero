document.addEventListener('DOMContentLoaded', () => {
    const SIZE = 8;
    let board = Array.from({length: SIZE}, ()=>Array(SIZE).fill(null));
    let currentColor = 'B', playerColor = 'B', aiColor = 'W', aiThinking = false;
    let aiDifficulty = 'NORMAL'; // デフォルト

	const csrfMeta = document.querySelector('meta[name="_csrf"]');
	const csrfHeaderMeta = document.querySelector('meta[name="_csrf_header"]');
	const csrfToken = csrfMeta ? csrfMeta.content : null;
	const csrfHeader = csrfHeaderMeta ? csrfHeaderMeta.content : null;
	
    // --- 難易度セレクト連動 ---
    const difficultySelect = document.getElementById('difficulty');
    aiDifficulty = difficultySelect.value.toUpperCase();
    difficultySelect.addEventListener('change', ()=>{
        aiDifficulty = difficultySelect.value.toUpperCase();
        initBoard();
    });

    // --- 初期化 ---
    function initBoard() {
        board = Array.from({length: SIZE}, ()=>Array(SIZE).fill(null));
        board[3][3]='W'; board[3][4]='B'; board[4][3]='B'; board[4][4]='W';
        currentColor='B'; aiThinking=false;
        document.getElementById('replayBtn').style.display='none';
        renderBoard();
    }

    // --- 合法手判定 ---
    function canPlace(r,c,color){
        if(board[r][c]!==null) return false;
        const opp = color==='B'?'W':'B';
        for(const [dx,dy] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]){
            let x=r+dx, y=c+dy, hasOpp=false;
            while(x>=0 && x<SIZE && y>=0 && y<SIZE){
                if(board[x][y]===opp) hasOpp=true;
                else if(board[x][y]===color){ if(hasOpp) return true; break; }
                else break;
                x+=dx; y+=dy;
            }
        }
        return false;
    }

    // --- ディスク配置 ---
    function placeDisk(r,c,color){
        if(!canPlace(r,c,color)) return false;
        board[r][c]=color;
        const opp=color==='B'?'W':'B';
        for(const [dx,dy] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]){
            let x=r+dx, y=c+dy, toFlip=[];
            while(x>=0 && x<SIZE && y>=0 && y<SIZE){
                if(board[x][y]===opp) toFlip.push([x,y]);
                else if(board[x][y]===color){ toFlip.forEach(([fx,fy])=>board[fx][fy]=color); break; }
                else break;
                x+=dx; y+=dy;
            }
        }
        return true;
    }

    function hasValidMove(color){ 
        return board.flat().some((v,i)=>canPlace(Math.floor(i/SIZE), i%SIZE, color)); 
    }

    // --- UI更新 ---
    function updatePlayerUI(){
        const black = board.flat().filter(x=>'B'===x).length;
        const white = board.flat().filter(x=>'W'===x).length;
        const p = document.getElementById('playerUI'), a = document.getElementById('aiUI');
        p.innerHTML = `プレイヤー<br>黒: ${black}`;
        a.innerHTML = `AI<br>白: ${white}`;
        p.classList.remove('current-turn'); a.classList.remove('current-turn');
        if(currentColor===playerColor){
            p.style.transform='scale(1.1)'; p.classList.add('current-turn'); 
            a.style.transform='scale(1)'; a.classList.remove('thinking');
        } else if(currentColor===aiColor){
            p.style.transform='scale(1)'; 
            a.classList.add('thinking'); a.classList.add('current-turn');
        } else {
            p.style.transform='scale(1)'; a.classList.remove('thinking'); a.style.transform='scale(1)';
        }
    }

    // --- プレイヤークリック ---
    document.getElementById('board').addEventListener('click', (e)=>{
        const cell = e.target.closest('.cell');
        if(!cell) return;
        if(currentColor !== playerColor || aiThinking) return;
        const r = parseInt(cell.dataset.row);
        const c = parseInt(cell.dataset.col);
        if(canPlace(r,c,playerColor)){
            placeDisk(r,c,playerColor);
            currentColor = aiColor;
            renderBoard();
        }
    });

    // --- 描画 ---
    function renderBoard(){
        const bd=document.getElementById('board'); bd.innerHTML='';
        for(let i=0;i<SIZE;i++){
            for(let j=0;j<SIZE;j++){
                const cell=document.createElement('div'); 
                cell.className='cell'; 
                cell.dataset.row=i; 
                cell.dataset.col=j;
                if(board[i][j]){
                    const d=document.createElement('div'); 
                    d.className='disk '+(board[i][j]==='B'?'black':'white'); 
                    cell.appendChild(d); 
                } else if(currentColor===playerColor && canPlace(i,j,playerColor)){
                    cell.classList.add('valid');
                }
                bd.appendChild(cell);
            }
        }
        updatePlayerUI();

        const playerCan = hasValidMove(playerColor);
        const aiCan = hasValidMove(aiColor);

        if(!playerCan && !aiCan){
            gameOver();
            return;
        }

        if(currentColor===playerColor && !playerCan){
            currentColor = aiColor;
            setTimeout(renderBoard, 500);
            document.getElementById('info').innerHTML = "プレイヤーは置けません。パスします。";
            return;
        }

        if(currentColor===aiColor && !aiCan){
            currentColor = playerColor;
            setTimeout(renderBoard, 500);
            document.getElementById('info').innerHTML = "AIは置けません。パスします。";
            return;
        }

        if(currentColor===aiColor){
            aiThinking=true; 
            setTimeout(()=>{ aiMove(); aiThinking=false; }, 50);
        } else {
            document.getElementById('info').innerHTML = "";
        }
    }

    // --- 評価関数（HARD用） ---
    const POSITION_WEIGHT = [
      [99,-8, 8, 6, 6, 8,-8,99],
      [-8,-24,-4,-3,-3,-4,-24,-8],
      [ 8, -4, 7, 4, 4, 7, -4, 8],
      [ 6, -3, 4, 0, 0, 4, -3, 6],
      [ 6, -3, 4, 0, 0, 4, -3, 6],
      [ 8, -4, 7, 4, 4, 7, -4, 8],
      [-8,-24,-4,-3,-3,-4,-24,-8],
      [99,-8, 8, 6, 6, 8,-8,99]
    ];

    function evaluateBoard(color){
        const opp = color==='B'?'W':'B';
        let score = 0;
        for(let i=0;i<SIZE;i++){
            for(let j=0;j<SIZE;j++){
                if(board[i][j]===color) score += POSITION_WEIGHT[i][j];
                else if(board[i][j]===opp) score -= POSITION_WEIGHT[i][j];
            }
        }
        const myDisks = board.flat().filter(x=>x===color).length;
        const oppDisks = board.flat().filter(x=>x===opp).length;
        score += (myDisks - oppDisks)*5;
        return score;
    }

    // --- ミニマックス＋αβ枝刈り ---
    function minimax(depth, maximizingPlayer, color, alpha=-Infinity, beta=Infinity){
        const moves = [];
        for(let i=0;i<SIZE;i++){
            for(let j=0;j<SIZE;j++){
                if(canPlace(i,j,color)) moves.push([i,j]);
            }
        }

        if(depth===0 || moves.length===0){
            return evaluateBoard(aiColor);
        }

        const oppColor = color==='B'?'W':'B';

        if(maximizingPlayer){
            let maxEval = -Infinity;
            for(const [r,c] of moves){
                const backup = board.map(row => row.slice());
                placeDisk(r,c,color);
                const evalScore = minimax(depth-1, false, oppColor, alpha, beta);
                board = backup;
                if(evalScore > maxEval) maxEval = evalScore;
                if(evalScore > alpha) alpha = evalScore;
                if(beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for(const [r,c] of moves){
                const backup = board.map(row => row.slice());
                placeDisk(r,c,color);
                const evalScore = minimax(depth-1, true, oppColor, alpha, beta);
                board = backup;
                if(evalScore < minEval) minEval = evalScore;
                if(evalScore < beta) beta = evalScore;
                if(beta <= alpha) break;
            }
            return minEval;
        }
    }

    // --- AI手 ---
    function aiMove(){
        const moves = [];
        for(let i=0;i<SIZE;i++){
            for(let j=0;j<SIZE;j++){
                if(canPlace(i,j,aiColor)) moves.push([i,j]);
            }
        }

        if(moves.length === 0){
            currentColor = playerColor;
            renderBoard();
            return;
        }

        let bestMove, bestScore = -Infinity;

        if(aiDifficulty === 'EASY'){
            bestMove = moves[Math.floor(Math.random()*moves.length)];
        } else if(aiDifficulty === 'NORMAL'){
            bestMove = moves.find(([r,c]) => (r===0||r===7) && (c===0||c===7)) 
                       || moves[Math.floor(Math.random()*moves.length)];
        } else if(aiDifficulty === 'HARD'){
            const searchDepth = 3; // HARD向け
            for(const [r,c] of moves){
                const backup = board.map(row => row.slice());
                placeDisk(r,c,aiColor);
                const score = minimax(searchDepth-1, false, playerColor);
                board = backup;
                if(score > bestScore){
                    bestScore = score;
                    bestMove = [r,c];
                }
            }
        }

        placeDisk(bestMove[0], bestMove[1], aiColor);
        currentColor = playerColor;
        renderBoard();
    }

    // --- スコア送信 ---
    function submitScore(finalScore){
        fetch('/api/scores', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                [csrfHeader]: csrfToken
            },
            body: JSON.stringify({ score: finalScore })
        })
        .then(res => {
            if(res.ok){
                window.location.href = "/ranking";
            } else {
                console.error("スコア保存失敗");
            }
        })
        .catch(err => console.error(err));
    }

    function gameOver() {
        const finalScore = board.flat().filter(x=>'B'===x).length;
        submitScore(finalScore);
    }

    // --- ボタン ---
    document.getElementById('resetBtn').addEventListener('click', initBoard);
    document.getElementById('replayBtn').addEventListener('click', ()=>{ 
        document.getElementById('replayBtn').style.display='none'; 
        initBoard(); 
    });

    initBoard();
});
