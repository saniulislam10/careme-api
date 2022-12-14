exports.allowCross = (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, HEAD, COPY, PATCH, DELETE,  OPTIONS, PURGE, PROPFIND, VIEW, LINK, UNLINK, LOCK, UNLOCK");
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization');
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Accept, Content-Type, Authorization, Administrator, Marketer");
    next();
}
