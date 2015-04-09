exports.mockAjaxFulfill = function(mockData){
    return function(options) {
        return new Promise(function(f,r){
            if (options.success){
                options.success(mockData);
            }
            f(mockData);
        });
    };
};

exports.mockAjaxFulfillFn = function(fn){
    return function(options) {
        return new Promise(function(f,r){
            if (options.success){
                options.success(fn());
            }
            f(fn);
        });
    };
}

exports.mockAjaxReject = function(mockData){
    return function(options) {
        return new Promise(function(f,r){
            r(mockData);
        });
    };
};
