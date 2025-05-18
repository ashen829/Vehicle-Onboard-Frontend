import { View, Text, Image, TextInput } from 'react-native'
import React from 'react'
import { icons } from '@/constants/icons'

interface Props {
    placeholder : string;
    onPress?: ( )=> void;
}

const SearchBar = ({placeholder, onPress}: Props) => {
  return (
    <View>
      <View className='flex-row items-center bg-white border-gray-400 border rounded-full px-5 py-0\.5'>
        <Image source={icons.search} className='size-5' resizeMode='contain' tintColor='gray'/>
        <TextInput onPress={onPress}
            placeholder={placeholder}
            value=""
            onChangeText={()=>{}}
            placeholderTextColor='gray'
            className='flex-1 ml-2 text-white'/>

      </View>
    </View>
  )
}

export default SearchBar