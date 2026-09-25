//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'employee_password_reset_dto.g.dart';

/// EmployeePasswordResetDto
///
/// Properties:
/// * [reason] 
@BuiltValue()
abstract class EmployeePasswordResetDto implements Built<EmployeePasswordResetDto, EmployeePasswordResetDtoBuilder> {
  @BuiltValueField(wireName: r'reason')
  String get reason;

  EmployeePasswordResetDto._();

  factory EmployeePasswordResetDto([void updates(EmployeePasswordResetDtoBuilder b)]) = _$EmployeePasswordResetDto;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(EmployeePasswordResetDtoBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<EmployeePasswordResetDto> get serializer => _$EmployeePasswordResetDtoSerializer();
}

class _$EmployeePasswordResetDtoSerializer implements PrimitiveSerializer<EmployeePasswordResetDto> {
  @override
  final Iterable<Type> types = const [EmployeePasswordResetDto, _$EmployeePasswordResetDto];

  @override
  final String wireName = r'EmployeePasswordResetDto';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    EmployeePasswordResetDto object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'reason';
    yield serializers.serialize(
      object.reason,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    EmployeePasswordResetDto object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required EmployeePasswordResetDtoBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'reason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.reason = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  EmployeePasswordResetDto deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = EmployeePasswordResetDtoBuilder();
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


