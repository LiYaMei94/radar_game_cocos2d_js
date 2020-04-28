module.exports = {
	get_random_int,
	get_random_array_elements,
	del_arr_elem,
	get_coor,
	disorder
}

/**
 * 根据范围和每个小正方形的大小获取在这个范围内每个小正方形的坐标
 * */
function get_coor(size, min, max) {
	var coor_arr = [];
	for (var i = min; i < max; i = i + size) {
		for (var j = min; j < max; j = j + size) {
			coor_arr.push([i, j])
		}
	}
	return coor_arr;
}

/**
 * 将数组乱序输出
 * */
function disorder(arr) {
	var newArr = [];
	for (var i = 0; i < arr.length; i++) {
		var index = Math.floor(Math.random() * arr.length); //随机下标
		newArr.push(arr[index]); //将随机出的元素，存放新数组newArr中去
		arr.splice(index, 1); //    将随机出的元素在arr中删除            
	}
	//arr中删除随机出的元素,arr.length-1,同时i++,导致循环不会10次,会是5次.最后得到newArr中只有一半的随机数字,arr中剩下另一半. 将其合并到一起,得到res
	return [...newArr, ...arr];

}
/**
 * 随机生成min到max之间的随机数，包括min和max
 * */
function get_random_int(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
 * 随机从数组中取出count个元素
 * */
function get_random_array_elements(arr, count) {
	var shuffled = arr.slice(0),
		i = arr.length,
		min = i - count,
		temp, index;
	while (i-- > min) {
		index = Math.floor((i + 1) * Math.random());
		temp = shuffled[index];
		shuffled[index] = shuffled[i];
		shuffled[i] = temp;
	}
	return shuffled.slice(min);
}


/**
 * 删除数组中所有重复的元素
 * */
function del_arr_elem(arr, del_arr) {

	//临时数组存放
	var tempArray1 = []; //临时数组1
	var tempArray2 = []; //临时数组2

	for (var i = 0; i < del_arr.length; i++) {
		tempArray1[del_arr[i]] = true; //将数del_arr 中的元素值作为tempArray1 中的键，值为true；
	}

	for (var i = 0; i < arr.length; i++) {
		if (!tempArray1[arr[i]]) {
			tempArray2.push(arr[i]); //过滤arr 中与del_arr 相同的元素；
		}
	}
	// console.log(tempArray2)
	return tempArray2;
}
