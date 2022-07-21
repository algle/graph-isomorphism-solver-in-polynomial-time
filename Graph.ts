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
    static solve(g1: Graph, g2: Graph) {
        var g1Result = g1.calcPropagation()
        var g2Result = g2.calcPropagation()
        return JSON.stringify(g1Result) == JSON.stringify(g2Result)
    }
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
    parseJson(json) {
        this.arrows = []
        var pj = JSON.parse(json)
        for (var i = 0; i < pj.length; i++) {
            this.arrows.push(new Edge(pj[i][0], pj[i][1]))
        }
    }
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
    sortWeightList(weights) {
        weights.sort(this.compareWeight);
    }
    isSame(first, second) {
        return (this.compareWeight(first, second) == 0)
    }
    compareWeight(first, second) {
        if (first[1][0] - second[1][0] != 0) {
            // より大きなnについてv(i,n)に含まれている点が大きい
            return - (first[1][0] - second[1][0])
        }
        if (first[1][1].length - second[1][1].length != 0) {
            // より大きなnについてv(i,n)の点と辺を共有している方が大きい
            return - (first[1][1].length - second[1][1].length);
        }
        var minLen = Math.min(first[1][1].length, second[1][1].length);
        for(var i = minLen - 1; i >= 0; i--){
            if (first[1][1][i] == null) {
                first[1][1][i] = 0;
            }
            if (second[1][1][i] == null) {
                second[1][1][i] = 0;
            }
            if (first[1][1][i] > second[1][1][i]) {
                return -1;
            }
            if (first[1][1][i] < second[1][1][i]) {
                return 1;
            }
        }
        return 0;
    }
    /**
     * 伝播の結果の点を比較する
     * @param first (first.length == second.length)はtrueと仮定
     * @param second 
     * @returns 
     */
     static comparePropagation(first, second) {
        var resultSub
        for(var i = 0; i < first.length; i++){
            resultSub = Graph.comparePropagationSub(first[i], second[i])
            if (resultSub != 0) {
                return resultSub
            }
        }
        return 0
    }
    static comparePropagationSub(first, second) {
        var minLen = Math.min(first.length, second.length);
        for(var i = 0; i < minLen; i++){
            if (first[i] == null) {
                first[i] = 0;
            }
            if (second[i] == null) {
                second[i] = 0;
            }
            var result = Graph.idAndWeightCompare(first[1], second[1])
            if (result != 0) {
                return result
            }
        }
        return first.length - second.length;
    }
    static idAndWeightCompare(first, second) {
        if (first[1][0] - second[1][0] != 0) {
            return - (first[1][0] - second[1][0])
        }
        if (first[1][1].length - second[1][1].length != 0) {
            return - (first[1][1].length - second[1][1].length);
        }
        for (var i = 0; i < first[1][1].length; i++) {
            if (first[1][1][i] != second[1][1][i]) {
                return first[1][1][i] - second[1][1][i]
            }
        }
        return 0
    }
    calcPropagation() {
        var result = []
        // グラフの点の数
        var numOfVertices = this.calcNumOfVertices()
        for (var i = 0; i < numOfVertices; i++) {
            result[i] = [];
            var idList = []
            for (var i2 = 0; i2 < numOfVertices; i2++) {
                if (i2 == i) {
                    idList.push(1)
                }
                else {
                    idList.push(0)
                }
            }
            var numOfPhase = numOfVertices * 2
            for (var i3 = 0; i3 < numOfPhase; i3++) {  
                var weightList = []
                for (var i2 = 0; i2 < numOfVertices; i2++) {
                    weightList.push([this.deepCopy(idList[i2]), []])
                }
                for (var i2 = 0; i2 < this.arrows.length; i2++) {
                    if (weightList[this.arrows[i2].start][1][idList[this.arrows[i2].end]] == null) {
                        weightList[this.arrows[i2].start][1][idList[this.arrows[i2].end]] = 1
                    }
                    else {
                        weightList[this.arrows[i2].start][1][idList[this.arrows[i2].end]] += 1
                    }
                    if (weightList[this.arrows[i2].end][1][idList[this.arrows[i2].start]] == null) {
                        weightList[this.arrows[i2].end][1][idList[this.arrows[i2].start]] = 1
                    }
                    else {
                        weightList[this.arrows[i2].end][1][idList[this.arrows[i2].start]] += 1
                    }
                }
                var weightAndIdlist = []
                for (var i2 = 0; i2 < weightList.length; i2++) {
                    weightAndIdlist.push([i2, weightList[i2]])
                }
                this.sortWeightList(weightAndIdlist)
                idList = []
                var idCount = 0
                for (var i2 = weightAndIdlist.length - 1; i2 >= 0; i2--) {
                    if (i2 == weightAndIdlist.length - 1) {
                        idList[weightAndIdlist[i2][0]] = idCount
                    }
                    else {
                        if (!this.isSame(weightAndIdlist[i2 + 1], weightAndIdlist[i2])) {
                            idCount++
                        }
                        else {
                        }
                        idList[weightAndIdlist[i2][0]] = idCount
                    }
                }
                var phaseResult = this.createPhase(weightAndIdlist);
                result[i].push(phaseResult)
                if (phaseResult[0][1][0] == (numOfVertices - 1)) {
                    break;
                }
            }
        }
        result.sort(Graph.comparePropagation);
        return result
    }
    deepCopy(v) {
        return JSON.parse(JSON.stringify(v))
    }
    static deepCopy(v) {
        return JSON.parse(JSON.stringify(v))
    }
    createPhase(weightAndIdlist) {
        for (var i = 0; i < weightAndIdlist.length; i++) {
            for (var i2 = 0; i2 < weightAndIdlist[i][1][1].length; i2++) {
                if (weightAndIdlist[i][1][1][i2] == null) {
                    weightAndIdlist[i][1][1][i2] = 0;
                }
            }
        }
        var result = [[1, weightAndIdlist[0][1]]];
        for (var i = 1; i < weightAndIdlist.length; i++) {
            for (var i2 = 0; i2 < weightAndIdlist[i][1].length; i2++) {
                if (weightAndIdlist[i][1][i2] == null) {
                    weightAndIdlist[i][1][i2] = 0;
                }
            }
            if (JSON.stringify(weightAndIdlist[i - 1][1]) == JSON.stringify(weightAndIdlist[i][1])) {
                result[result.length - 1][0]++
            }
            else {
                result.push([1, Graph.deepCopy(weightAndIdlist[i][1])])
            }
        }
        return result
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
    start: number
    end: number
}
