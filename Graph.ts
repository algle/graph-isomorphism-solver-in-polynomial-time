// グラフ同型判定問題に関連する関数
export class Graph {
    arrows: Array<Edge> = []

    toFtuchtGraph() {
        this.parseJson("[[0, 1], [0, 5], [0, 11], [1, 2], [1, 3], [2, 3], [2, 10], [3, 4], [4, 5], [4, 6], [5, 6], [6, 7], [7, 8], [7, 9], [8, 9], [8, 11], [9, 10], [10, 11]]")
    }

    /**
     * JSONをグラフに変換する
     * @param json 
     */
    parseJson(json) {
        // 初期化
        this.arrows = []
        var pj = JSON.parse(json)
        for (var i = 0; i < pj.length; i++) {
            this.arrows.push(new Edge(pj[i][0], pj[i][1]))
        }
    }
    
    /**
     * グラフの情報をJSONに変換する
     * @returns 
     */
     toJson(): string {
        var result = "["
        for (var i = 0; i < this.arrows.length - 1; i++) {
            result += this.arrows[i].toJson() + ","
        }
        if (this.arrows.length > 0) {
            result += this.arrows[this.arrows.length - 1].toJson()
        }
        result += "]"
        return result 
    }
    
    parseMatrixJson(json) {
        // 初期化
        this.arrows = []
        var pj = JSON.parse(json)
        for (var i = 0; i < pj.length; i++) {
            for (var i2 = 0; i2 < pj.length; i2++) {
                if (pj[i][i2] == 1) {
                    if (!this.isExist(i, i2)) {
                        this.arrows.push(new Edge(i, i2))
                    }
                }
            }
        }
    }

    toMatrixJson(): string {
        var resultJson = []
        var numOfVertices = this.calcNumOfVertices();
        for (var i = 0; i < numOfVertices; i++) {
            var line = []
            for (var i2 = 0; i2 < numOfVertices; i2++) {
                line.push(0)
            }
            resultJson.push(line)
        }
        for (var i = 0; i < this.arrows.length; i++) {
            resultJson[this.arrows[i].start][this.arrows[i].end] = 1
            resultJson[this.arrows[i].end][this.arrows[i].start] = 1
        }
        return JSON.stringify(resultJson)
    }

        
    /**
     * 辺が存在するか判定する
     * @param s 
     * @param e 
     */
    isExist(s, e) {
        for (var i = 0; i < this.arrows.length; i++) {
            if (this.arrows[i].start == s && this.arrows[i].end == e) {
                return true
            }
            if (this.arrows[i].start == e && this.arrows[i].end == s) {
                return true
            }
        }
        return false
    }

    /**
     * 点のIDを入れ替える
     * @param v1 
     * @param v2 
     */
    change(v1, v2) {
        for (var i = 0; i < this.arrows.length; i++) {
            if (this.arrows[i].start == v1) {
                this.arrows[i].start = v2
            }
            else if (this.arrows[i].start == v2) {
                this.arrows[i].start = v1
            }
            if (this.arrows[i].end == v1) {
                this.arrows[i].end = v2
            }
            else if (this.arrows[i].end == v2) {
                this.arrows[i].end = v1
            }
        }
    }

    calcNumOfVertices(): number {
        var max = -1
        if (this.arrows.length > 0) {
            max = this.arrows[0].start
        }
        for (var i = 0; i < this.arrows.length; i++) {
            if (max < this.arrows[i].start) {
                max = this.arrows[i].start
            }
            if (max < this.arrows[i].end) {
                max = this.arrows[i].end
            }
        }
        return max + 1;
    }

    static solve(g1: Graph, g2: Graph) {
        var g1Result = g1.calcKoutei(0)
        var numOfVertices = g2.calcNumOfVertices()
        for (var i = 0; i < numOfVertices; i++) {
            var g2Result = g2.calcKoutei(i)
            if (JSON.stringify(g1Result) == JSON.stringify(g2Result)) {
                return true
            }
        }
        return false
    }

    compareWeight(first, second) {
        if (first[1] - second[1] != 0) {
            // より大きなnについてv(i,n)に含まれている点が大きい
            return - (first[1] - second[1])
        }

        if (first[2].length - second[2].length != 0) {
            // より大きなnについてv(i,n)の点と辺を共有している方が大きい
            return - (first[2].length - second[2].length);
        }

        // var minLen = Math.min(first[1][1].length, second[1][1].length);
        for(var i = first[2].length - 1; i >= 0; i--){
            if (first[2][i] == null) {
                first[2][i] = 0;
            }
            if (second[2][i] == null) {
                second[2][i] = 0;
            }
            if (first[2][i] > second[2][i]) {
                return -1;
            }
            if (first[2][i] < second[2][i]) {
                return 1;
            }
        }
        return 0;
    }

    deepCopy(v) {
        return JSON.parse(JSON.stringify(v))
    }

    /**
     * 工程の計算
     * @param vId 点のID
     */
    calcKoutei(vId) {
        // グラフの点の数
        var numOfVertices = this.calcNumOfVertices()
        // 各点の「どの集合に含まれているかの情報」と「辺を共有している点の集合のID」
        var vWeight = []
        // 初期値で注目している点に集合v(i,1)に入れる、それ以外に集合v(i,0)を入れる
        for (var i = 0; i < numOfVertices; i++) {
            if (i == vId) {
                vWeight.push([i, 1, []])
            }
            else {
                vWeight.push([i, 0, []])
            }
        }
        var vWeightTmp
        var vWeightTmp2
        var prevIdCount = 1
        while (true) {
            // 各点に対して、どの集合の要素と何本の辺を共有しているかを数える。
            for (var i = 0; i < this.arrows.length; i++) {
                if (vWeight[this.arrows[i].start][2][vWeight[this.arrows[i].end][1]] == null) {
                    // 値がない場合は1にする
                    vWeight[this.arrows[i].start][2][vWeight[this.arrows[i].end][1]] = 1
                }
                else {
                    // 値がある場合は1を足す
                    vWeight[this.arrows[i].start][2][vWeight[this.arrows[i].end][1]] += 1
                }
                if (vWeight[this.arrows[i].end][2][vWeight[this.arrows[i].start][1]] == null) {
                    vWeight[this.arrows[i].end][2][vWeight[this.arrows[i].start][1]] = 1
                }
                else {
                    vWeight[this.arrows[i].end][2][vWeight[this.arrows[i].start][1]] += 1
                }
            }
            // 得られた結果を以下のルールで並べる。
            vWeight.sort(this.compareWeight);
            vWeightTmp = this.deepCopy(vWeight)
            vWeight = [];
            var idCount = 0
            vWeight[vWeightTmp[vWeightTmp.length - 1][0]] = [vWeightTmp[vWeightTmp.length - 1][0], this.deepCopy(idCount), []]
            for (var i = vWeightTmp.length - 1 - 1; i >= 0; i--) {
                if (this.compareWeight(vWeightTmp[i + 1], vWeightTmp[i]) != 0) {
                    idCount++
                }
                vWeight[vWeightTmp[i][0]] = [vWeightTmp[i][0], this.deepCopy(idCount), []]
            }
            if (prevIdCount == idCount) {
                break;
            }
            prevIdCount = idCount
        }
        var result = []
        for (var i = 0; i < vWeightTmp.length; i++) {
            for (var i2 = 0; i2 < vWeightTmp[i][2].length; i2++) {
                if (vWeightTmp[i][2][i2] == null) {
                    vWeightTmp[i][2][i2] = 0
                }
            }
            result.push([this.deepCopy(vWeightTmp[i][1]), this.deepCopy(vWeightTmp[i][2])])
        }
        return result;
    }
}

export class Edge {
    constructor(s, e) {
        this.start = s;
        this.end = e;
    }

    toJson() {
        return "[" + this.start + "," + this.end + "]"
    }

    /**
     * 0以上とする
     */
    start: number
    /**
     * 0以上とする
     */
    end: number
}
