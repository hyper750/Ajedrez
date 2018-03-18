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
            this.tempsActual -= (actual - this.tempsSessio);
            this.tempsSessio = null;
        }
    };

    this.getTemps = function (ms) {
        var m = parseInt(ms / 60000);
        var s = parseInt((ms - (m * 60000)) / 1000);
        m = m.toString();
        while(m.length < 2){
            m = "0" + m;
        }
        s = s.toString();
        while(s.length < 2){
            s = "0" + s;
        }
        return m + ":" + s;
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
    this.intervalTemps = null;
    //Llista 0 blanques
    //Llista 1 negres
    this.figuresMortes = [];
    this.llistaMoviments = [[], []];
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

    this.posicioPecaSeleccionada = function () {
        for(var t = 0; t < this.caselles.length; t++){
            for(var p = 0; p < this.caselles[t].length; p++){
                var tmp = this.caselles[t][p];
                if(tmp.seleccionada){
                    return [t, p];
                }
            }
        }

        return [];
    };

    this.pecaSeleccionada = function () {
        var posicio = this.posicioPecaSeleccionada();
        return this.caselles[posicio[0]][posicio[1]];
    };

    this.sercarCanviar = function () {
        for(var x = 0; x < this.caselles.length; x++){
            for(var y = 0; y < this.caselles[x].length; y++){
                if(this.caselles[x][y].canviar){
                    return this.caselles[x][y];
                }
            }
        }

        return null;
    };

    this.sercarRei = function (color) {
        var col = "white";
        if(color === 1){
            col = "black";
        }

        for(var x = 0; x < this.caselles.length; x++){
            for(var y = 0; y < this.caselles[x].length; y++){
                var cas = this.caselles[x][y];
                if(cas.figura !== null && cas.figura instanceof Rei && cas.figura.color === col){
                    return cas;
                }
            }
        }

        return null;
    };

    //x i y son a von vol anar
    this.moure = function (x, y, simulacio) {
        //Agaf sa seleccionada i sa nova posició es sa x:y
        var selec = this.pecaSeleccionada();

        var novaCasella = this.caselles[x][y];
        if(novaCasella.preMoviment){
            if(!simulacio && novaCasella.figura !== null && novaCasella.figura instanceof Rei && !this.acabat){
                //Si té menjes es rei acabar es joc
                this.acabat = true;
                msgGuanyador(this);
                this.torn = (this.torn + 1) % 2;
            }
            //Si té una figura
            if(!simulacio && novaCasella.figura !== null){
                this.figuresMortes.push(novaCasella.figura);
            }
            novaCasella.figura = selec.figura;
            selec.figura = null;
            if(!simulacio && novaCasella.figura instanceof Peon){
                //Primera vegada
                if(novaCasella.figura.inicial) {
                    novaCasella.figura.inicial = false;
                }

                //Permet canviar la figura
                if((novaCasella.figura.color == "white" && x == 0) || (novaCasella.figura.color == "black" && x == this.caselles.length-1)){
                    msgCanviarFigura(novaCasella, this);
                }
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

    this.calcularJaqueMate = function (color) {
        var col = "white";
        if(color === 1){
            col = "black";
        }
        var rei = null;
        for(var x = 0; x < this.caselles.length; x++){
            for(var y = 0; y < this.caselles[x].length; y++){
                var cas = this.caselles[x][y];
                if(cas.figura !== null && cas.figura instanceof Rei && cas.figura.color === col){
                    rei = cas;
                }
            }
        }

        //Una vegada trobat es rei des color demanat
        if(rei.figura !== null){
            //Mogui on me mogui estic en jaque
            for(var x = 0; x < this.caselles.length; x++){
                for(var y = 0; y < this.caselles[x].length; y++){
                    var cas = this.caselles[x][y];
                    //Si es des mateix color permetre sa simulacio
                    if(cas.figura !== null && cas.figura.color === col){
                        for(var i = 0; i < this.caselles.length; i++){
                            for(var j = 0; j < this.caselles[i].length; j++){
                                cas.seleccionada = true;
                                //posar-la a totes ses caselles possibles
                                this.preMoure(x, y);
                                if(this.caselles[i][j].preMoviment) {
                                    var tmpFigura = this.caselles[i][j].figura;
                                    this.moure(i, j, true);
                                    this.calcularJaque();
                                    this.caselles[x][y].figura = this.caselles[i][j].figura;
                                    this.caselles[i][j].figura = tmpFigura;
                                    if (!rei.figura.jaque) {
                                        return false;
                                    }
                                }
                            }
                        }
                        cas.seleccionada = false;

                    }

                }
            }



        }

        return true;
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

}

function Casella(color, figura) {
    this.color = color;
    //Sa casella conté o no una figura
    this.figura = figura;
    this.preMoviment = false;
    this.seleccionada = false;
    this.canviar = false;
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
    this.nom = "Peon";
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
            //Si no tenc cap figura a sa que menjar després puc moure, si no obligat a menjar
            //if ((diagonalEsquerra == null || !diagonalEsquerra.preMoviment) && (diagonalDreta == null || !diagonalDreta.preMoviment)) {
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
            //}
        }
        //alert("DiagonalDreta: " + diagonalDreta.color + "\nDiagonalEsquerra: " + diagonalEsquerra.color);
    };

    //Moure nomes es mirar si a sa casella esta en mode PreMoviment
}

Peon.prototype = new Figura();
Peon.prototype.constructor = Peon;

function Torre(color){
    Figura.call(this, color);
    this.nom = "Torre";
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
    this.nom = "Cavall";
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
    this.nom = "Alfil";
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
    this.nom = "Rei";
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
    this.nom = "Reina";
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

function Moviment(tipus, origen, desti) {
    this.tipus = tipus;
    this.origen = origen;
    this.desti = desti;
}

function pintarLlistaMoviments(escacs) {
    var llistaPerTorn = escacs.llistaMoviments[escacs.torn];
    var resultat = "";
    for(var x = 0; x < llistaPerTorn.length; x++){
        resultat += llistaPerTorn[x].tipus + " de " + llistaPerTorn[x].origen.formatEscacs() + " a " + llistaPerTorn[x].desti.formatEscacs() + "<br/>";
    }

    $("#llistaMoviments").html(resultat);
}

function missatgeGeneral(text) {
    var camp = $("#missatgeGeneral");
    $("#totOpac").css("display", "block");
    camp.text(text);
    camp.animate({
        top: "+=500"
    });
}

function msgGuanyador(escacs) {
    var guanyador = "blanques";
    if(escacs.torn == 1){
        guanyador = "negres";
    }
    missatgeGeneral("Han guanyat les " + guanyador);
}

function msgJaque(escacs) {
    missatgeGeneral("Escolta es teu rei està amb jaque, mou-lo");
}

function msgNoEsElTeuTorn(escacs){
    missatgeGeneral("No es el teu torn");
}

function msgJaqueMate(escacs){
    var guanyador = "blanques";
    if(escacs.torn == 1){
        guanyador = "negres";
    }
    missatgeGeneral("Han guanyat les " + guanyador + " per jaque mate");
}

function msgAhogado(escacs) {
    var guanyador = "blanques";
    if(escacs.torn == 1){
        guanyador = "negres";
    }
    missatgeGeneral("Han guanyat les " + guanyador + " per jaque per ahogado");
}
function msgCanviarFigura(casella, escacs, tablero) {
    //casella.figura = new Torre(casella.figura.color);
    var mostrar = "<select>";
    var cont = 0;
    for(var x = 0; x < escacs.figuresMortes.length; x++){
        if(casella.figura.color === escacs.figuresMortes[x].color && !(escacs.figuresMortes[x] instanceof Peon)) {
            mostrar += "<option value=\"" + x + "\">" + escacs.figuresMortes[x].nom + "</option>";
            cont++;
        }
    }
    mostrar += "</select>";

    $("#figures").html(mostrar);

    if(cont > 0) {
        casella.canviar = true;
        $("div#totOpac").css("display", "block");
        $("#canviarFigura").animate({
            top: "+=500"
        });
    }
}

function Punt(y, x) {
    const LLETRES_HORIZONTAL = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const NUMEROS_VERTICALS = ["8", "7", "6", "5", "4", "3", "2", "1"];
    this.y = y;
    this.x = x;

    this.formatEscacs = function () {
        return LLETRES_HORIZONTAL[this.x] + NUMEROS_VERTICALS[this.y];
    };
}

function tempsAcabat(escacs) {
    escacs.torn = (escacs.torn + 1) % 2;
    escacs.acabat = true;
    var color = "blanques";
    if(escacs.torn === 1){
        color = "negres";
    }
    missatgeGeneral("S'ha acabat es temps, guanyen les " + color);
}

function IntervalTemps(escacs){
    this.id = null;
    this.escacs = escacs;

    var Interval = this;

    this.startInterval = function () {
        if(this.id === null) {
            this.id = setInterval(function () {
                var temps = $("#tempsTorn").text();
                var tempsSplit = temps.split(":");
                var m = parseInt(tempsSplit[0]) * 60000;
                var s = parseInt(tempsSplit[1]) * 1000;
                var ms = m + s;
                ms -= 1000;
                var t = new Temps();
                var resultat = t.getTemps(ms);
                $("#tempsTorn").text(resultat);
                if(ms <= 0){
                    clearInterval(Interval.id);
                    Interval.id = null;
                    tempsAcabat(Interval.escacs);
                }
            }, 1000);
        }
    };

    this.stopInterval = function () {
        if(this.id !== null) {
            clearInterval(this.id);
            this.id = null;
        }
    };
}

function pintarMortes(escacs) {
    var torn = "white";
    if(escacs.torn == 1){
        torn = "black";
    }
    var resultat = "";
    for(var x = 0; x < escacs.figuresMortes.length; x++){
        var fig = escacs.figuresMortes[x];
        if(fig.color == torn){
            resultat += "<img class='icona' alt='" + fig.nom + "' src='" + fig.imatge + "'/>"
        }
    }
    $("#llistaPecesMortes").html(resultat);
}

function click(tthis, escacs, tablero) {
    if(!escacs.acabat) {
        //Que fer quan cliques sa casella
        var separat = $(tthis).attr("id").split(":");
        var casella = escacs.caselles[separat[0]][separat[1]];

        //Si sa casella està seleccionada per moure, pues mou, tant per moure com matar
        if(casella.preMoviment){
            //Si estic en jaque tenc que fer algo perque no estigui en jaque, moure es rei,
            //Si no estic en jaque puc moure ses peces
            var seleccionada = escacs.posicioPecaSeleccionada();
            var peca = escacs.caselles[seleccionada[0]][seleccionada[1]].figura;
            escacs.moure(separat[0], separat[1], false);
            //Antes de canviar el torn afegir a sa llista de moviments
            escacs.llistaMoviments[escacs.torn].push(new Moviment(peca.nom, new Punt(seleccionada[0], seleccionada[1]), new Punt(separat[0], separat[1])));
            pintarTorn(escacs);

            //Calcular temps i començar es següent turno
            escacs.equipTemps[escacs.torn].restarSessio();
            escacs.intervalTemps.stopInterval();
            escacs.torn = (escacs.torn + 1) % 2;
            $("#tempsTorn").text(escacs.equipTemps[escacs.torn].getTemps(escacs.equipTemps[escacs.torn].tempsActual));

            if(!escacs.acabat) {
                escacs.intervalTemps.startInterval();
                escacs.equipTemps[escacs.torn].startSessio();
            }

            pintarMortes(escacs);

            pintarLlistaMoviments(escacs);
            //Una vegada que canviat de torn canviar color des torn
            //I també mirar si es rei esta amb jaque

            if(escacs.calcularJaqueMate(escacs.torn)){
                //Si esta en jaque es jaquemate
                escacs.calcularJaque();
                var rei = escacs.sercarRei(escacs.torn);
                console.log("Color " + rei.torn + " esta en jaque? " + rei.jaque);
                //Si està en jaque es jaquemate
                if(rei.figura.jaque){
                    msgJaqueMate(escacs);
                }
                //Si no està en jaque pero mogui on es mogui hi estarà es jaque per ahogado
                else{
                    msgAhogado(escacs);
                }
                //Si no esta en jaque per ahogado

            }

            escacs.calcularJaque();

            pintar(escacs, tablero);
            //Mir si es jaquemate
            //Si es jaquemate posarà acabate = true
        }
        else if (casella.figura !== null) {
            //Nomes es pugui moure si no està amb jaque o si esta amb jaque i has seleccionat es rei, o alguna peça per interceptar o matar-la
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
                pintar(escacs, tablero);
            }
            else {
                msgNoEsElTeuTorn(escacs)
            }
        }
    }
    else{
        //Msg guanyador
        msgGuanyador(escacs);
    }
    //Fi clicar
}

function pintar(escacs, tablero) {
    tablero.text("");
    for(var x = 0; x < escacs.caselles.length; x++){
        var tr = $("<tr></tr>");
        for(var y = 0; y < escacs.caselles[x].length; y++){
            var td = $("<td></td>").attr("id", x + ":" + y);
            td.on("click",function () {
                click(this, escacs, tablero);
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
    var escacs;
    $("#seleccionarTemps").animate({
        top: "+=500"
    });

    $("div#totOpac").css({
        width: $(window).width(),
        height: $(window).height()
    });

    $("#enviarTemps").on("click", function () {
        var temps = $("#entradaTemps");
        var labelTemps = $("#labelTemps");
        var tempsValor = parseInt(temps.val());

        if(tempsValor >= 1) {
            escacs = new Escacs(tempsValor);
            escacs.intervalTemps = new IntervalTemps(escacs);
            pintar(escacs, tablero);
            var tempsTorn = escacs.equipTemps[escacs.torn];
            $("#tempsTorn").text(tempsTorn.getTemps(tempsTorn.tempsActual));
            escacs.intervalTemps.startInterval();
            escacs.equipTemps[escacs.torn].startSessio();

            $("#seleccionarTemps").animate({
                top: "-=500"
            });
            $(".temps, .caixaPecesMortes, .informacio, #tablero").fadeIn();
            temps.val("");
            temps.removeClass("wrong-form");
            labelTemps.removeClass("wrong-label");
        }
        else{
            temps.addClass("wrong-form");
            labelTemps.addClass("wrong-label");
        }
    });

    $("#canviar").on("click", function () {
        $("#canviarFigura").animate({
            top: "-=500"
        });
        var selected = $("#figures :checked").val();
        //Figura morta seleccionada
        var casACanviar = escacs.sercarCanviar();
        if(casACanviar != null){
            casACanviar.canviar = false;
            casACanviar.figura = escacs.figuresMortes[selected];
            escacs.figuresMortes.splice(selected, 1);
            pintar(escacs, tablero);
        }
        $("div#totOpac").css("display", "none");
    });

    $("div#totOpac").on("click", function () {
        if($("#missatgeGeneral").css("top") !== "-300px"){
            $("#missatgeGeneral").animate({
                top: "-=500"
            });
        }

        if($("#canviarFigura").css("top") === "-300px") {
            $(this).css("display", "none");
        }
    });

});
