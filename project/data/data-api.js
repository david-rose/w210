

function loaddata(filename)
{
    var req = new XMLHttpRequest();
    // make an asynchronous call to retrieve the electricity data
    req.open("GET", "./data/" + filename, false);
    req.send(null);
    return JSON.parse(req.responseText);
}

function loadarticles()
{
    return loaddata("articles_positive.json");
}

function loadarticles-agg()
{
    return loaddata("articles_positive_agg.json");
}


function capitalize(s)
{
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function isnumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function getarticlelist(topic, enddate, windowsize)
{
    var alist = [];
    var article = new Object();
    var startdate = enddate - windowsize;
    for (var i = 0; i < articles.length; i++)
    {
        var a = articles[i];
        if (a['topic'] == topic && a['publish_date'] >= startdate && a['publish_date'] <= enddate)
        {
            alist.push(a);
        }
    }
    return alist;    
}


function sortbypercent(x, y)
{
    // sort by 'percent' field in decreasing order
    return (sortby(x, y, 'percent') * -1);
}

function sortby(x, y, field)
{
    var xp = x[field];
    var yp = y[field];
    r = 0; // default is equals
    if (xp < yp)
    {
        r = -1;
    }
    else if (xp > yp)
    {
        r = 1;
    }
    return r;
}


var TopFive = function(category, year, units)
{
    this.category = category;
    this.year = year;
    this.total = 0;
    this.units = units;
    this.countries = [];
    this.addcountry = function(country)
    {
        this.countries.push(country);
        if (this.units == null)
        {
            this.units = country.units;
        }
    };
    this.settopfive = function(direction)
    {
        if (direction == 'desc')
        {
            this.countries.sort(sortbyvaluedescending);
        }
        else
        {
            this.countries.sort(sortbyvalueascending);
        }
        for (var i = 0; i < 5 && i < this.countries.length; i++)
        {
            this.countries[i].rank = (i + 1);
            this.total += this.countries[i].value;
        }
        this.countries.splice(5, Number.MAX_VALUE);
    };
    this.maxvalue = function()
    {
        var maximum = 0;
        for (var i = 0; i < this.countries.length; i++)
        {
            if (this.countries[i].value > maximum)
            {
                maximum = this.countries[i].value;
            }
        }
        return maximum;
    }
};

var TopFiveCountry = function(name, rank, value, units)
{
    this.name = name;
    this.rank = rank;
    this.value = value;
    this.units = units;
}

function sortbyvaluedescending(x, y)
{
    // sort in descending order
    return (sortby(x, y, 'value') * -1);
}
function sortbyvalueascending(x, y)
{
    // sort in ascending order
    return (sortby(x, y, 'value') * 1);
}

var topfivecategories = ['Total Production', 'Total Consumption', 'Renewable', 'Nuclear'];
function gettopfivedata(region, year, valuetype, flowlist, direction)
{
    var topfivedata = {};
    for (var i = 0; i < flowlist.length; i++)
    {
        category = flowlist[i];
        topfivedata[category] = new TopFive(category, year, null);
    }
    var yeardata = getcountryyeardata(region, year);
    for (var name in yeardata)
    {
        var yd = yeardata[name];
        var units = getunits(valuetype, yd.population);
        for (var i = 0; i < flowlist.length; i++)
        {
            var category = flowlist[i];
            var value = Math.round(units.mult * yd[category]);
            topfivedata[category].addcountry(new TopFiveCountry(name, 0, value, units.units));
        }
    }
    var tmp = [];
    for (var i = 0; i < flowlist.length; i++)
    {
        var category = flowlist[i];
        topfivedata[category].settopfive(direction);
        tmp.push(topfivedata[category]);
    }
    return tmp;
}
function gettopfivecountrieslist(year, valuetype, flow)
{
    var t5 = gettopfivecountries(year, valuetype, flow);
    countries = [];
    for (var i = 0; i < t5.countries.length; i++)
    {
        countries.push(t5.countries[i].name);
    }
    return countries;
}

function gettopfivecountries(year, valuetype, flow)
{
    var t5 = new TopFive(flow, year, null);
    var yeardata = getcountryyeardata(year);
    for (var name in yeardata)
    {
        var yd = yeardata[name];
        var units = getunits(valuetype, yd.population);
        var value = Math.round(units.mult * yd[flow]);
        t5.addcountry(new TopFiveCountry(name, 0, value, units.units));
    }
    t5.settopfive();
    return t5;
}

