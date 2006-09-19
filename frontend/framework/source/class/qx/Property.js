/*
#module(newproperties)
#require(qx.type.StringBuilder)
#require(qx.lang.Object)
#require(qx.Validation)
*/

qx.OO.defineClass("qx.Property",
{

  add : function(vName)
  {
    if (qx.Proto._properties_available_ng[vName]) {
      this.error("Add property: Property: " + vName + " does already exist!");
    }

    // Vererbe property registry von der Superklasse
    this.inheritCheck();

    // Füge neue Hashmap hinzu
    qx.Proto._properties_available_ng[vName] =
    {
      relation : qx.Proto,
      upname : vName.charAt(0).toUpperCase() + vName.substr(1)
    };

    // Merke mir dieses Property als aktuelles (zum Tunen)
    this._current = vName;
  },

  remove : function(vName)
  {
    if (!qx.Proto._properties_available_ng[vName]) {
      this.error("Remove property: Property: " + vName + " does not exist!");
    }

    // Vererbe property registry von der Superklasse
    this.inheritCheck();

    // Lösche kompletten Eintrag
    delete qx.Proto._properties_available_ng[vName];

    // Wenn dieses Property aktuell ausgewählt war, müssen wir es zurücksetzen
    if (this._current == vName) {
      this._current = null;
    }
  },

  sel : function(vName)
  {
    if (!qx.Proto._properties_available_ng[vName]) {
      this.error("Select property: Property: " + vName + " does not exist!");
    }

    this._current = vName;
  },

  // alternativen: setAttribute?
  tune : function(vKey, vValue)
  {
    if (this._current == null) {
      this.error("Tune property: Please select a property first!");
    }

    // Vererbe property registry von der Superklasse
    this.inheritCheck();

    // Wenn das Property von der Superklasse definiert wurde, müssen wir
    // hier auf einer Kopie der HashMap operieren.
    if (qx.Proto._properties_available_ng[this._current] === qx.Super.prototype._properties_available_ng[this._current])
    {
      // Ganzen Property-Eintrag kopieren (damit dieser dann modifiziert werden kann ohne den Parent zu aendern)
      qx.Proto._properties_available_ng[this._current] = qx.lang.Object.copy(qx.Proto._properties_available_ng[this._current]);

      // Update relations-Information
      qx.Proto._properties_available_ng[this._current].relation = qx.Proto;
    }

    // Speichere neuen Wert
    qx.Proto._properties_available_ng[this._current][vKey] = vValue;


  },

  inheritCheck : function()
  {
    if (qx.Proto._properties_available_ng == qx.Super.prototype._properties_available_ng) {
      this.inherit();
    }
  },

  inherit : function()
  {
    // Das passiert beim Vererben. Wir kopieren die Liste einfach
    // Kein deep copy. Es werden nur Daten-Objekte kopiert sobald
    // versucht wird ein property anzupassen.
    qx.Proto._properties_available_ng = qx.lang.Object.copy(qx.Proto._properties_available_ng);
  },

  createMethods : function(vName, vProto)
  {
    var vEntry = vProto._properties_available_ng[vName];
    var vUpName = vEntry.upname;

    vProto["set" + vUpName] = function() {
      return qx.Property._generalSetter(this, vProto, vName, vUpName, arguments);
    };

    //vProto["set" + vUpName] = new Function("return qx.Property._generalSetter(this, " + vName + "," + vUpName + ",arguments);");
    vProto["get" + vUpName] = new Function("return this._values_ng." + vName + ";");
    vProto["reset" + vUpName] = new Function("return this.set" + vUpName + "(null);");
  },

  validate : function(vMethod, vValue)
  {
    if (vMethod)
    {
      try
      {
        qx.Validation[vMethod](vValue);
      }
      catch(ex)
      {
        this.error("Failed validation process", ex);
        return false;
      }
    }

    return true;
  },

  _generalSetter : function(vObject, vProto, vName, vUpName, vArgs)
  {
    vProto.debug("Creating setter for " + vProto + "/" + vName);

    // Create new setter
    var vSetter = qx.Property._createOptimizedSetter(vProto, vName, vUpName);
    vProto["set" + vUpName] =  vSetter;

    // Execute new setter
    return vSetter.apply(vObject, vArgs);
  },







  _createOptimizedSetter : function(vProto, vName, vUpName)
  {
    var vConf = vProto._properties_available_ng[vName];
    var vCode = new qx.type.StringBuilder;

    // vCode.add("this.debug('Property: " + vName + ": ' + vNew);");
    vCode.add("var vOld = this._properties_available_ng." + vName + ";");

    if (vConf.validation != undefined)
    {
      vCode.add("try{");

      if (qx.Validation[vConf.validation])
      {
        vCode.add("if(!qx.Validation." + vConf.validation + "(vNew)){");
        vCode.add("this.error('Invalid value for property " + vName + ": ' + vNew);");
        vCode.add("};");
      }
      else
      {
        this.error("Could not add validation to property " + vName + ". Invalid method.");
      }

      vCode.add("}catch(ex){");
      vCode.add("this.error('Invalid value: ' + vNew, ex);");
      vCode.add("};");
    }

    vCode.add("this._values_ng." + vName + " = vNew;");

    if (vConf.fire !== false)
    {
      vCode.add("this.createDispatchDataEvent('change" + vUpName + "');");
    }

    // alert("Code:\n\n" + vCode);

    return new Function("vNew", vCode.toString());
  }





});
