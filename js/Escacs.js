//Temps en minuts
function Temps(temps){
    //Pas a ms
    this.tempsActual = temps * 60000;
    this.tempsSessio = null;

    this.startSessio = function () {
        if(this.tempsSessio === null){
            this.tempsSessio = new Date();
        }
    };

    this.restarSessio = function () {
        var actual = new Date();
        if(this.tempsSessio !== null){
            this.tempsActual -= (this.actual - this.tempsSessio);
            this.tempsSessio = null;
        }
    };
}

function Escacs(temps) {
    const AMPLADA = 8;
    const ALTURA = 8;
    //0 torn blanques
    //1 torn negres
    this.torn = 0;
    //temps 0 blanques
    //temps 1 negres
    this.equipTemps = [new Temps(temps), new Temps(temps)];
    this.acabat = false;
    this.casellaSeleccionada = null;
    this.caselles = [];
    for(var x = 0; x < ALTURA; x++){
        var fila = [];
        for(var y = 0; y < AMPLADA; y++){
            var color = "black";
            if((y+x) % 2 == 0){
                color = "white";
            }
            fila.push(new Casella(color, null));
        }
        this.caselles.push(fila);
    }

    //Colocar peces
    //NEGRES
    //PEONS
    for(var x = 0; x < AMPLADA; x++){
        this.caselles[1][x].figura = new Peon("black");
    }
    //BLANQUES
    //PEONS
    for(var x = 0; x < AMPLADA; x++){
        this.caselles[ALTURA-2][x].figura = new Peon("white");
    }

    //TORRE CAVALL ALFIL REINA REI
    var color = ["black", "white"];
    var num = 0;
    for(var x = 0; x < ALTURA; x += ALTURA-1) {
        this.caselles[x][0].figura = new Torre(color[num]);
        this.caselles[x][AMPLADA - 1].figura = new Torre(color[num]);
        this.caselles[x][1].figura = new Cavall(color[num]);
        this.caselles[x][AMPLADA - 2].figura = new Cavall(color[num]);
        this.caselles[x][2].figura = new Alfil(color[num]);
        this.caselles[x][AMPLADA - 3].figura = new Alfil(color[num]);
        this.caselles[x][3].figura = new Reina(color[num]);
        this.caselles[x][AMPLADA-4].figura = new Rei(color[num]);
        num++;
    }

    this.deseleccionar = function () {
        //Deseleccionar totes i seleccionar sa nova
        for(var q = 0; q < this.caselles.length; q++){
            for(var p = 0; p < this.caselles[q].length; p++){
                //Si no seleccion un moviment viable es deselecciona
                var act = this.caselles[q][p];
                act.seleccionada = false;
                act.preMoviment = false;
            }
        }
    };

    //x i y es sa casella seleccionada
    this.preMoure = function (x, y) {
        //Retorna es moviments que pot fer
        var casella = this.caselles[x][y];
        if(casella !== undefined && casella.figura !== null) {
            casella.figura.preMoviment(x, y, this.caselles);
        }
    };

    //x i y son a von vol anar
    this.moure = function (x, y) {
        //Agaf sa seleccionada i sa nova posició es sa x:y
        var selec = null;
        for(var t = 0; t < this.caselles.length; t++){
            for(var p = 0; p < this.caselles[t].length; p++){
                var tmp = this.caselles[t][p];
                if(tmp.seleccionada){
                    selec = tmp;
                }
            }
        }

        var novaCasella = this.caselles[x][y];
        if(novaCasella.preMoviment){
            if(novaCasella.figura !== null && novaCasella.figura instanceof Rei && !this.acabat){
                //Si té menjes es rei acabar es joc
                this.acabat = true;
                msgGuanyador(this);
                this.torn = (this.torn + 1) % 2;
            }
            novaCasella.figura = selec.figura;
            selec.figura = null;
            if(novaCasella.figura instanceof Peon){
                novaCasella.figura.inicial = false;
            }
        }

        this.deseleccionar();
    };

    this.calcularJaque = function () {
        //Mirar si es rei està amb jaque des torn actual
        //0 blanc
        //1 negre
        //casella.figura.jaque = true
        this.deseleccionarJaque();
        for(var x = 0; x < this.caselles.length; x++){
            for(var y = 0; y < this.caselles[x].length; y++){
                var cas = this.caselles[x][y];
                this.preMoure(x, y);

                for(var p = 0; p < this.caselles.length; p++){
                    for(var t = 0; t < this.caselles[p].length; t++){
                        var f = this.caselles[p][t];
                        //Mir si es rei està en jaque
                        if(f.preMoviment && f.figura !== null && f.figura instanceof Rei){
                            f.figura.jaque = true;
                        }
                    }
                }


            }
        }

        this.deseleccionar();
    };

    this.deseleccionarJaque = function () {
        for(var x = 0; x < this.caselles.length; x++){
            for(var y = 0; y < this.caselles[x].length; y++){
                if(this.caselles[x][y].figura !== null && this.caselles[x][y].figura instanceof Rei){
                    this.caselles[x][y].figura.jaque = false;
                }
            }
        }
    };

    this.reiAmbJaqueTurnoActual = function (color) {
        var turno = "white";
        if(color === 1){
            turno = "black";
        }
        for(var x = 0; x < this.caselles.length; x++){
            for(var y = 0; y < this.caselles[x].length; y++){
                var cas = this.caselles[x][y];
                if(cas.figura !== null && cas.figura instanceof Rei && cas.figura.color === turno){
                    return cas.figura.jaque;
                }
            }
        }
    };

    this.reiAmbJaqueMate = function () {
        //Seleccion es dos reis
        this.calcularJaque();
        var reis = [];
        for(var x = 0; x < this.caselles.length; x++){
            for(var y = 0; y < this.caselles[x].length; y++){
                var cas = this.caselles[x][y];
                if(cas.figura !== null && cas.figura instanceof Rei){
                    if(cas.figura.color === "white"){
                        reis[0] = [x, y, cas.figura.jaque];
                    }
                    else if(cas.figura.color === "black"){
                        reis[1] = [x, y, cas.figura.jaque];
                    }
                }
            }
        }
        //Es dos reis trobats
        //Mirar si es poden moure o matar
        for(var i = 0; i < reis.length; i++){
            //Moure es rei a ses posicions i mirar si està en jaque
            //Si a totes ses posicions està en jaque es jaque mate
            //Moure a totes ses posicions que pot es rei de preMoure
            for(var t = 0; t < this.caselles.length; t++){
                for(var p = 0; p < this.caselles[t].length; p++){
                    this.deseleccionar();
                    this.caselles[reis[i][0]][reis[i][1]].seleccionada = true;
                    this.preMoure(reis[i][0], reis[i][1]);
                    var cas = this.caselles[t][p];
                    if(cas.preMoviment){
                        //Si es una casella que puc anar
                        //Si hi ha una figura no s'elimini
                        var figuraTmp = this.caselles[t][p].figura;
                        this.deseleccionarJaque();
                        this.moure(t, p);
                        this.calcularJaque();
                        if(!cas.figura.jaque){
                            reis[i][2] = false;
                        }
                        this.caselles[reis[i][0]][reis[i][1]].figura = this.caselles[t][p].figura;
                        this.caselles[t][p].figura = figuraTmp;
                    }
                }
            }
            this.deseleccionar();
            this.deseleccionarJaque();
            this.calcularJaque();

            //Si no puc moure una casella des mateix equip que es rei perque no estigui en jaque
            var rei = this.caselles[reis[i][0]][reis[i][1]];
            sortida:
            for(var t = 0; t < this.caselles.length; t++){
                for(var p = 0; p < this.caselles[t].length; p++){
                    var seg = this.caselles[t][p];
                    if(seg.figura !== null && seg.figura.color === rei.figura.color && reis[i][0] !== t && reis[i][1] !== p){
                        this.deseleccionar();
                        this.deseleccionarJaque();
                        seg.seleccionada = true;
                        this.preMoure(t, p);
                        //Moure sa figura
                        for(var u = 0; u < this.caselles.length; u++){
                            for(var k = 0; k < this.caselles[u].length; k++){
                                var desti = this.caselles[u][k];
                                if(desti.preMoviment){
                                    var figuraTmp = this.caselles[u][k].figura;
                                    this.moure(u, k);
                                    this.calcularJaque();
                                    this.caselles[t][p].figura = this.caselles[u][k].figura;
                                    this.caselles[u][k].figura = figuraTmp;
                                    if(!rei.jaque){
                                        reis[i][2] = false;
                                        break sortida;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }


        //0 blanc 1 negre i diu si esta amb jaquemate per color
        return [reis[0][2], reis[1][2]];
    };
}

function Casella(color, figura) {
    this.color = color;
    //Sa casella conté o no una figura
    this.figura = figura;
    this.preMoviment = false;
    this.seleccionada = false;
}

function Figura(color) {
    this.color = color;
    this.check = function (copiaAltura, copiaAmplada, caselles) {
        if(copiaAltura >= 0 && copiaAltura < caselles.length && copiaAmplada >= 0 && copiaAmplada < caselles[copiaAltura].length){
            var seguent = caselles[copiaAltura][copiaAmplada];
            //Si hi ha casella
            //Si sa següent figura es de diferent color que sa figura que tens seleccionada per moure
            if(seguent.figura !== null){
                if(seguent.figura.color !== this.color){
                    //Menjar
                    seguent.preMoviment = true;
                    return false;
                }
                //Tant menjar com una figura des mateix equip aturar de contar
                return false;
            }
            else{
                seguent.preMoviment = true;
                return true;
            }
        }
        else{
            return false;
        }
    };
}

//Per cada figura posar una descendent i cada una amb es seu moviment
function Peon(color) {
    Figura.call(this, color);
    this.imatge = "img/";
    this.inicial = true;
    if (this.color == "white") {
        this.imatge += "blanques/";
    }
    else {
        this.imatge += "negres/";
    }
    this.imatge += "peon.png";

    //Li pas sa seleccionada
    this.preMoviment = function (altura, amplada, caselles) {
        //Pre moviment
        //Si tenc colcu a un nes dos laterals esta obligat a matar
        var amp;
        var alt;
        if(this.color === "white") {
            //Resta 1 per ses diagonals
            //Diagonal esquerra
            alt = parseInt(altura) - 1;
            amp = parseInt(amplada);
        }
        else{
            //Suma 1 per ses diagonals
            alt = parseInt(altura) + 1;
            amp = parseInt(amplada);
        }
        if(alt >= 0 && alt < caselles.length) {
            var diagonalEsquerra = null;
            var diagonalDreta = null;
            if((amp-1 >= 0 && amp-1 < caselles[alt].length)) {
                diagonalEsquerra = caselles[alt][amp - 1];
                if (diagonalEsquerra.figura !== null && diagonalEsquerra.figura.color !== this.color) {
                    diagonalEsquerra.preMoviment = true;
                }
            }
            if((amp+1 >= 0 && amp+1 < caselles[alt].length)){
                //Diagonal dreta
                diagonalDreta = caselles[alt][amp + 1];
                if (diagonalDreta.figura !== null && diagonalDreta.figura.color !== this.color) {
                    diagonalDreta.preMoviment = true;
                }
            }
            //Si no tenc cap figura a sa que menjar després puc moure, si no obligat
            if ((diagonalEsquerra == null || !diagonalEsquerra.preMoviment) && (diagonalDreta == null || !diagonalDreta.preMoviment)) {
                var pases = 1;
                if (this.inicial) {
                    //+1
                    pases++;
                }
                var al = altura;
                for (var w = 0; w < pases; w++) {
                    if (this.color == "white") {
                        al--;
                    }
                    else {
                        al++;
                    }
                    var seguent = caselles[al][amplada];
                    //Si no te figura marcar
                    if (seguent.figura === null) {
                        seguent.preMoviment = true;
                    }
                    else {
                        //Si té colcú en frente no mirar es següents
                        break;
                    }
                }
            }
        }
        //alert("DiagonalDreta: " + diagonalDreta.color + "\nDiagonalEsquerra: " + diagonalEsquerra.color);
    };

    //Moure nomes es mirar si a sa casella esta en mode PreMoviment
}

Peon.prototype = new Figura();
Peon.prototype.constructor = Peon;

function Torre(color){
    Figura.call(this, color);
    this.imatge = "img/";
    if(this.color == "white"){
        this.imatge += "blanques/";
    }
    else{
        this.imatge += "negres/";
    }
    this.imatge += "Torre.png";

    this.preMoviment = function (altura, amplada, caselles){
        //Dos loops
        //altura fins que trobi uns figura
        //Si sa figura es enemiga la pots menjar si no pues te queda a s'anterior
        var actual = caselles[altura][amplada];
        //Endavant
        var copiaAltura = parseInt(altura);
        var copiaAmplada = parseInt(amplada);
        var seguir = true;

        //Adalt
        while(seguir){
            if(this.color == "white"){
                copiaAltura--;
            }
            else{
                copiaAltura++;
            }
            seguir = this.check(copiaAltura, copiaAmplada, caselles);
        }

        seguir = true;
        copiaAltura = parseInt(altura);
        copiaAmplada = parseInt(amplada);
        //A baix
        while(seguir){
            if(this.color == "white"){
                copiaAltura++;
            }
            else{
                copiaAltura--;
            }
            seguir = this.check(copiaAltura, copiaAmplada, caselles);
        }

        seguir = true;
        copiaAltura = parseInt(altura);
        copiaAmplada = parseInt(amplada);
        while(seguir){
            if(this.color == "white"){
                copiaAmplada++;
            }
            else{
                copiaAmplada--;
            }
            seguir = this.check(copiaAltura, copiaAmplada, caselles);
        }

        seguir = true;
        copiaAltura = parseInt(altura);
        copiaAmplada = parseInt(amplada);
        while(seguir){
            if(this.color == "white"){
                copiaAmplada--;
            }
            else{
                copiaAmplada++;
            }
            seguir = this.check(copiaAltura, copiaAmplada, caselles);
        }
    };
}

Torre.prototype = new Figura();
Torre.prototype.constructor = Torre;

function Cavall(color){
    Figura.call(this, color);
    this.imatge = "img/";
    if(this.color == "white"){
        this.imatge += "blanques/";
    }
    else{
        this.imatge += "negres/";
    }
    this.imatge += "Cavall.png";

    this.preMoviment = function (altura, amplada, caselles) {
        var copiaAltura = parseInt(altura);
        var copiaAmplada = parseInt(amplada);
        this.check(copiaAltura-2, copiaAmplada-1, caselles);
        this.check(copiaAltura-2, copiaAmplada+1, caselles);
        this.check(copiaAltura-1, copiaAmplada+2, caselles);
        this.check(copiaAltura-1, copiaAmplada-2, caselles);

        this.check(copiaAltura+2, copiaAmplada-1, caselles);
        this.check(copiaAltura+2, copiaAmplada+1, caselles);
        this.check(copiaAltura+1, copiaAmplada+2, caselles);
        this.check(copiaAltura+1, copiaAmplada-2, caselles);
    };
}

Cavall.prototype = new Figura();
Cavall.prototype.constructor = Cavall;

function Alfil(color){
    Figura.call(this, color);
    this.imatge = "img/";
    if(this.color == "white"){
        this.imatge += "blanques/";
    }
    else{
        this.imatge += "negres/";
    }
    this.imatge += "Alfil.png";

    this.preMoviment = function (altura, amplada, caselles) {
        var seguirDreta = true;
        var seguirEsquerra = true;
        var copiaDreta = parseInt(amplada);
        var copiaEsquerra = parseInt(amplada);
        var copiaAltura = parseInt(altura);
        //Diagonal superior
        while(seguirDreta || seguirEsquerra){
            if(this.color === "white"){
                copiaAltura--;
            }
            else{
                copiaAltura++;
            }
            copiaEsquerra--;
            copiaDreta++;
            if(seguirDreta){
                seguirDreta = this.check(copiaAltura, copiaDreta, caselles);
            }
            if(seguirEsquerra){
                seguirEsquerra = this.check(copiaAltura, copiaEsquerra, caselles);
            }
        }

        seguirDreta = true;
        seguirEsquerra = true;
        copiaAltura = parseInt(altura);
        copiaEsquerra = parseInt(amplada);
        copiaDreta = parseInt(amplada);
        while (seguirDreta || seguirEsquerra){
            if(this.color === "white"){
                copiaAltura++;
            }
            else{
                copiaAltura--;
            }
            copiaEsquerra--;
            copiaDreta++;
            if(seguirDreta){
                seguirDreta = this.check(copiaAltura, copiaDreta, caselles);
            }
            if(seguirEsquerra){
                seguirEsquerra = this.check(copiaAltura, copiaEsquerra, caselles);
            }
        }
    };

}

Alfil.prototype = new Figura();
Alfil.prototype.constructor = Alfil;

function Rei(color){
    Figura.call(this, color);
    this.jaque = false;
    this.imatge = "img/";
    if(this.color == "white"){
        this.imatge += "blanques/";
    }
    else{
        this.imatge += "negres/";
    }
    this.imatge += "Rei.png";

    this.preMoviment = function (altura, amplada, caselles) {
        var ampladaInt = parseInt(amplada);
        var alturaInt = parseInt(altura);
        for(var y = alturaInt-1; y <= alturaInt+1; y++) {
            for (var x = ampladaInt-1; x <= ampladaInt+1; x++) {
                this.check(y, x, caselles);
            }
        }
    };
}

Rei.prototype = new Figura();
Rei.prototype.constructor = Rei;

function Reina(color){
    Figura.call(this, color);
    this.imatge = "img/";
    if(this.color == "white"){
        this.imatge += "blanques/";
    }
    else{
        this.imatge += "negres/";
    }
    this.imatge += "Reina.png";

    this.preMoviment = function (altura, amplada, caselles){
        //No hi ha manera d'extendre de torre i alfil a la vegada
        new Torre(this.color).preMoviment(altura, amplada, caselles);
        new Alfil(this.color).preMoviment(altura, amplada, caselles);
    };

}

Reina.prototype = new Figura();
Reina.prototype.constructor = Reina;

function pintarTorn(escacs) {
    $("#torn").fadeOut("fast", function () {
        if(escacs.torn == 1){
            $("#torn").attr("class", "negre");
        }
        else{
            $("#torn").attr("class", "blanc");
        }
        $("#torn").fadeIn("fast");
    });
}

function msgGuanyador(escacs) {
    var guanyador = "blanques";
    if(escacs.torn == 1){
        guanyador = "negres";
    }
    alert("Han guanyat les " + guanyador);
}

function msgJaque(escacs) {
    alert("Escolta es teu rei està amb jaque, mou-lo");
}

function msgNoEsElTeuTorn(escacs){
    alert("No es el teu torn");
}

function msgJaqueMate(escacs){
    var guanyador = "blanques";
    if(escacs.torn == 1){
        guanyador = "negres";
    }
    alert("Han guanyat les " + guanyador + " per jaque mate");
}

function msgAhogado(escacs) {
    var guanyador = "blanques";
    if(escacs.torn == 1){
        guanyador = "negres";
    }
    alert("Han guanyat les " + guanyador + " per jaque per ahogado");
}

function pintar(escacs, tablero, titol) {
    tablero.text("");
    for(var x = 0; x < escacs.caselles.length; x++){
        var tr = $("<tr></tr>");
        for(var y = 0; y < escacs.caselles[x].length; y++){
            var td = $("<td></td>").attr("id", x + ":" + y);
            td.on("click",function () {
                if(!escacs.acabat) {
                    //Que fer quan cliques sa casella
                    var separat = $(this).attr("id").split(":");
                    var casella = escacs.caselles[separat[0]][separat[1]];

                    //Si sa casella està seleccionada per moure, pues mou, tant per moure com matar
                    if(casella.preMoviment){
                        //Si estic en jaque tenc que fer algo perque no estigui en jaque, moure es rei,
                        //Si no estic en jaque puc moure ses peces
                        escacs.moure(separat[0], separat[1]);
                        escacs.torn = (escacs.torn + 1) % 2;
                        //Una vegada que canviat de torn canviar color des torn
                        pintarTorn(escacs);
                        //I també mirar si es rei esta amb jaque
                        escacs.calcularJaque();
                        pintar(escacs, tablero, titol);
                        //Mir si es jaquemate
                        //Si es jaquemate posarà acabate = true
                        var colorJaque = escacs.reiAmbJaqueMate();
                        if(colorJaque[0] || colorJaque[1]){
                            if(!escacs.acabat){
                                escacs.acabat = true;
                                escacs.torn = (1 + this.torn) % 2;
                            }
                            var quin;
                            if(colorJaque[0]){
                                quin = 0;
                            }
                            else if(colorJaque[1]){
                                quin = 1;
                            }
                            //Si es blancs estan amb jaque mate
                            if(escacs.reiAmbJaqueTurnoActual(quin)){
                                //JaqueMate
                                msgJaqueMate(escacs);
                            }
                            else{
                                //Jaque per ahogado
                                msgAhogado(escacs);
                            }
                        }
                        //Msg guanyador
                        else if(escacs.acabat){
                            msgGuanyador(escacs);
                        }
                    }
                    else if (casella.figura !== null) {
                        //Nomes es pugui moure si no està amb jaque o si esta amb jaque i has seleccionat es rei, o alguna peça per interceptar o matar-la
                        if(!escacs.reiAmbJaqueTurnoActual(escacs.torn) || (escacs.reiAmbJaqueTurnoActual(escacs.torn) && casella.figura instanceof Rei)
                            ){
                            //0 blanques1
                            //1 negres
                            var color;
                            if (casella.figura.color == "white") {
                                color = 0;
                            }
                            else {
                                color = 1;
                            }
                            if (escacs.torn == color) {
                                //Si has seleccionar una altre figura des teu color
                                //Veure es moviments que pot fer
                                escacs.deseleccionar();
                                casella.seleccionada = true;
                                //Pintar de nou
                                escacs.preMoure(separat[0], separat[1]);
                                pintar(escacs, tablero, titol);
                            }
                            else {
                                msgNoEsElTeuTorn(escacs)
                            }
                        }
                        else{
                            msgJaque(escacs);
                        }
                    }
                }
                else{
                    //Msg guanyador
                    msgGuanyador(escacs);
                }
                //Fi clicar
            });
            var casella = escacs.caselles[x][y];
            if(casella.seleccionada){
                td.attr("class", "casellaSeleccionada");
            }
            else if(casella.preMoviment){
                td.attr("class", "casellaPreMoviment");
            }
            else if(casella.figura instanceof Rei && casella.figura.jaque){
                td.attr("class", "reiJaque");
            }
            else{
                td.attr("class", casella.color);
            }
            if(casella.figura !== null){
                td.css("background-image", "url(" + casella.figura.imatge + ")");
            }
            tr.append(td);
        }
        tablero.append(tr);
    }
}

//Temporizador 90 minuts per jugador en tota sa partida
//Canviar es color des panel d'informació segons es torn
$(document).ready(function () {
    var tablero = $("#tablero");
    var torn = $("#torn");
    var escacs = new Escacs(90);
    pintar(escacs, tablero, torn);
});
