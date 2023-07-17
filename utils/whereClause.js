class WhereClause {
    constructor(base, bigQ) {
        this.base = base;
        this.bigQ = bigQ;
    }
    search() {
        const searchword = this.bigQ.search ? {
            name: {
                $regex: this.bigQ.search,
                $options: 'i'
            }
        } : {}
        this.base = this.base.find({...searchword });
        return this;
    }

    filter() {
        const copyQ = {...this.bigQ };

        delete copyQ["search"];
        delete copyQ["limit"];
        delete copyQ["page"];

        // convert bigQ into a string => copyQ
        let stringOfCopyQ = JSON.stringify(copyQ);

        stringOfCopyQ = stringOfCopyQ.replace(/\b(gte|lte|gt|lt)\b/g, m => `$${m}`);

        const jsonOfCopyQ = JSON.parse(stringOfCopyQ);

        this.base = this.base.find(jsonOfCopyQ);
    }

    pager(resultperPage) {
        let currentPage = 1;
        if (this.bigQ.page) {
            currentPage = this.bigQ.page
        }
        const skipVal = resultperPage * (currentPage - 1);
        // (currentPage - 1); -> how many value we have to skip like 5 * (1-1)  = 0 so we have to skip 0 value on the first page and on the second page 5 * (2-1)  = 5 so we have to skip 5 value on the second page

        this.base = this.base.limit(resultperPage).skip(skipVal);
        return this;
    }

}