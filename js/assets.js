class SAET{ //SAErin asseTs

    //xhr fucntions shortcut
    static async emitReqCal(method, server, data = {}, callback = undefined, json = false) {
        var packet = null;

        if (method.toLowerCase() != "get") {
            packet = this.toFormaData(data);
        }
        else {
            server = server + "?" + this.serialize(data);
        }

        //create the request
        var xhr = new XMLHttpRequest();
        xhr.open(method, server, true);

        //create the listener for it response
        xhr.onreadystatechange = function () { //Appelle une fonction au changement d'état.
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                if (callback) {
                    var res = this.responseText;
                    if (json) {
                        res = JSON.parse(this.responseText);
                    }
                    callback(res);
                }
            }
        }
        //send the request
        xhr.send(packet);
    }

    static async emitReqPro(method, server, data = {}, json = false) {

        return new Promise((resolve, reject) => {

            var packet = null;

            if (method.toLowerCase() != "get") {
                packet = this.toFormaData(data);
            }
            else {
                server = server + "?" + this.serialize(data);
            }

            //create the request
            var xhr = new XMLHttpRequest();
            xhr.open(method, server, true);

            //create the listener for it response
            xhr.onreadystatechange = function () { //Appelle une fonction au changement d'état.
                if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                    var res = this.responseText;
                    if (json) {
                        res = JSON.parse(this.responseText);
                    }
                    resolve(res);
                }
            }
            //send the request
            xhr.send(packet);

        });
    }


    static serialize(obj) {
        var str = [];
        for (var p in obj)
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        return str.join("&");
    }

    static toFormaData(obj) {
        var formData = new FormData();
        for (const [key, value] of Object.entries(obj)) {
            formData.append(key, value);
        }
        return formData;
    }

}
