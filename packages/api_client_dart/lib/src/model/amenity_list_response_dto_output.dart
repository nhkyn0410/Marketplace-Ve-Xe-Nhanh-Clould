//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:api_client_dart/src/model/province_list_response_dto_output_items_inner.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'amenity_list_response_dto_output.g.dart';

/// AmenityListResponseDtoOutput
///
/// Properties:
/// * [items] 
@BuiltValue()
abstract class AmenityListResponseDtoOutput implements Built<AmenityListResponseDtoOutput, AmenityListResponseDtoOutputBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<ProvinceListResponseDtoOutputItemsInner> get items;

  AmenityListResponseDtoOutput._();

  factory AmenityListResponseDtoOutput([void updates(AmenityListResponseDtoOutputBuilder b)]) = _$AmenityListResponseDtoOutput;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AmenityListResponseDtoOutputBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AmenityListResponseDtoOutput> get serializer => _$AmenityListResponseDtoOutputSerializer();
}

class _$AmenityListResponseDtoOutputSerializer implements PrimitiveSerializer<AmenityListResponseDtoOutput> {
  @override
  final Iterable<Type> types = const [AmenityListResponseDtoOutput, _$AmenityListResponseDtoOutput];

  @override
  final String wireName = r'AmenityListResponseDtoOutput';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AmenityListResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(ProvinceListResponseDtoOutputItemsInner)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AmenityListResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AmenityListResponseDtoOutputBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(ProvinceListResponseDtoOutputItemsInner)]),
          ) as BuiltList<ProvinceListResponseDtoOutputItemsInner>;
          result.items.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AmenityListResponseDtoOutput deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AmenityListResponseDtoOutputBuilder();
    final serializedList = (serialized as Iterable<Object?>).toList();
    final unhandled = <Object?>[];
    _deserializeProperties(
      serializers,
      serialized,
      specifiedType: specifiedType,
      serializedList: serializedList,
      unhandled: unhandled,
      result: result,
    );
    return result.build();
  }
}


