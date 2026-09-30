//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:api_client_dart/src/model/fare_revision_list_response_dto_output_items_inner.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'fare_revision_list_response_dto_output.g.dart';

/// FareRevisionListResponseDtoOutput
///
/// Properties:
/// * [items] 
/// * [nextCursor] 
@BuiltValue()
abstract class FareRevisionListResponseDtoOutput implements Built<FareRevisionListResponseDtoOutput, FareRevisionListResponseDtoOutputBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<FareRevisionListResponseDtoOutputItemsInner> get items;

  @BuiltValueField(wireName: r'nextCursor')
  DateTime? get nextCursor;

  FareRevisionListResponseDtoOutput._();

  factory FareRevisionListResponseDtoOutput([void updates(FareRevisionListResponseDtoOutputBuilder b)]) = _$FareRevisionListResponseDtoOutput;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(FareRevisionListResponseDtoOutputBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<FareRevisionListResponseDtoOutput> get serializer => _$FareRevisionListResponseDtoOutputSerializer();
}

class _$FareRevisionListResponseDtoOutputSerializer implements PrimitiveSerializer<FareRevisionListResponseDtoOutput> {
  @override
  final Iterable<Type> types = const [FareRevisionListResponseDtoOutput, _$FareRevisionListResponseDtoOutput];

  @override
  final String wireName = r'FareRevisionListResponseDtoOutput';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    FareRevisionListResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(FareRevisionListResponseDtoOutputItemsInner)]),
    );
    yield r'nextCursor';
    yield object.nextCursor == null ? null : serializers.serialize(
      object.nextCursor,
      specifiedType: const FullType.nullable(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    FareRevisionListResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required FareRevisionListResponseDtoOutputBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(FareRevisionListResponseDtoOutputItemsInner)]),
          ) as BuiltList<FareRevisionListResponseDtoOutputItemsInner>;
          result.items.replace(valueDes);
          break;
        case r'nextCursor':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.nextCursor = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  FareRevisionListResponseDtoOutput deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = FareRevisionListResponseDtoOutputBuilder();
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


