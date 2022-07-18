var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017";
var data1 = {
  name: "Data1",
  work: "student",
  No: 4355453,
  Date_of_birth: new Date(1996, 10, 17),
};

var data2 = {
  name: "Data2",
  work: "student",
  No: 4355453,
  Date_of_birth: new Date(1996, 10, 17),
};

var data3 = {
  name: "Data3",
  work: "student",
  No: 4355453,
  Date_of_birth: new Date(1996, 10, 17),
};

var data4 = {
  name: "Data4",
  work: "student",
  No: 4355453,
  Date_of_birth: new Date(1996, 10, 17),
};

// var data5 = {
//   name: "Data5",
//   work: "student",
//   No: 4355453,
//   Date_of_birth: new Date(1996, 10, 17),
// };

MongoClient.connect(
  url,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },

  (err, client) => {
    if (err) {
      console.error(err);
      return;
    }

    db = client.db("scraping");
    scraping = db.collection("App");

    var Data = [data1, data2, data3, data4];

    scraping.insertMany(Data);

    var duplicates = [];

    scraping.aggregate([
      {
        $match: {
          name: { "$ne": '' }
        }
      },
      {
        $group: {
          _id: { name: "$name" },
          dups: { "$addToSet": "$_id" },
          count: { "$sum": 1 }
        }
      },
      {
        $match: {
          count: { "$gt": 1 }
        }
      }
    ],
      { allowDiskUse: true }
    )
      .forEach(function (doc) {
        doc.dups.shift();
        doc.dups.forEach(function (dupId) {
          duplicates.push(dupId);
        }
        )
      })
   
    scraping.deleteMany({ _id: { $in: duplicates } })

    console.log(Data)

    // scraping.deleteMany();
  }
);